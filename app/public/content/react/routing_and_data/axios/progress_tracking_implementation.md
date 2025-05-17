# Understanding Progress Tracking in Axios: From First Principles

Progress tracking in Axios allows you to monitor the status of HTTP requests in real-time. Let's explore this topic thoroughly, starting with the absolute fundamentals and building up to practical implementations.

> Learning how to track the progress of network requests is essential for creating responsive and user-friendly applications. It provides feedback to users about what's happening behind the scenes, reducing uncertainty and improving the overall user experience.

## 1. The Foundations: What is Axios?

Axios is a popular JavaScript library used for making HTTP requests from browsers and Node.js environments. At its core, Axios is a promise-based HTTP client that simplifies the process of sending asynchronous HTTP requests and handling responses.

Let's start with a simple example of an Axios request:

```javascript
import axios from 'axios';

// Making a basic GET request
axios.get('https://api.example.com/data')
  .then(response => {
    console.log('Data received:', response.data);
  })
  .catch(error => {
    console.error('Error occurred:', error);
  });
```

In this basic example, we're making a GET request to fetch data from a server. However, we have no insight into the progress of this request - we only know when it's completed or if it fails.

## 2. Understanding Progress Events: The Underlying Mechanism

Before diving into Axios's implementation, we need to understand how progress tracking works at a more fundamental level.

Progress tracking in web applications is built upon the `XMLHttpRequest` (XHR) object's progress events. Modern browsers implement the `ProgressEvent` interface, which provides information about the progress of an operation.

> The browser's XMLHttpRequest object is the foundation upon which Axios builds its functionality. It provides low-level events like `progress`, `load`, and `error` that allow us to monitor what's happening with our HTTP requests.

Key progress events include:

* `loadstart`: Fired when the request begins
* `progress`: Fired periodically as data is being received
* `abort`: Fired if the request is aborted
* `error`: Fired if an error occurs
* `load`: Fired when the request completes successfully
* `loadend`: Fired when the request has completed (after success, error, or abort)

## 3. Progress Event Properties: Understanding the Data

The `ProgressEvent` object provides several important properties:

* `loaded`: The amount of data that has been transferred so far (in bytes)
* `total`: The total amount of data to be transferred (in bytes), if known
* `lengthComputable`: A boolean indicating whether the total size is known

These properties enable us to calculate percentages and display meaningful progress information to users.

## 4. How Axios Implements Progress Tracking

Axios wraps the underlying XMLHttpRequest functionality and provides a clean interface for tracking progress. In Axios, progress tracking is implemented using the `onUploadProgress` and `onDownloadProgress` configuration options.

> Axios separates progress tracking into two distinct phases: upload and download. This distinction is crucial because many HTTP requests involve both sending data (upload) and receiving data (download).

Let's break down both types:

### Upload Progress Tracking

Upload progress tracking monitors how much of your request data (like when uploading a file) has been sent to the server.

```javascript
// Basic upload progress tracking
axios.post('https://api.example.com/upload', formData, {
  onUploadProgress: progressEvent => {
    // Calculate the percentage
    const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    console.log(`Upload Progress: ${percentage}%`);
  }
});
```

In this example:

* We're making a POST request to upload data
* The `onUploadProgress` callback receives progress events
* We calculate the percentage by dividing `loaded` by `total` and multiplying by 100
* We log the upload percentage to the console

### Download Progress Tracking

Download progress tracking monitors how much of the response data has been received from the server.

```javascript
// Basic download progress tracking
axios.get('https://api.example.com/largedata', {
  onDownloadProgress: progressEvent => {
    if (progressEvent.lengthComputable) {
      const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log(`Download Progress: ${percentage}%`);
    } else {
      // When content length is not known
      console.log(`Downloaded ${progressEvent.loaded} bytes`);
    }
  }
});
```

In this example:

* We're making a GET request to download data
* The `onDownloadProgress` callback receives progress events
* We check if the total size is known (`lengthComputable`)
* If it is, we calculate the percentage; if not, we just show the bytes received

## 5. Practical Example: Building a Progress Bar Component

Let's create a practical example of implementing a progress bar for file uploads with Axios:

```javascript
// HTML reference
// <div class="progress-container">
//   <div id="progress-bar" class="progress-bar"></div>
//   <div id="progress-text">0%</div>
// </div>

function uploadFileWithProgress(file) {
  // Create form data object
  const formData = new FormData();
  formData.append('file', file);
  
  // Get references to DOM elements
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  
  // Reset progress indicators
  progressBar.style.width = '0%';
  progressText.textContent = '0%';
  
  // Make the request with Axios
  return axios.post('https://api.example.com/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: progressEvent => {
      const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    
      // Update visual indicators
      progressBar.style.width = `${percentage}%`;
      progressText.textContent = `${percentage}%`;
    }
  });
}

// Usage
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    uploadFileWithProgress(file)
      .then(response => {
        console.log('Upload complete!', response.data);
      })
      .catch(error => {
        console.error('Upload failed:', error);
      });
  }
});
```

This example:

* Creates a function that uploads a file with progress tracking
* Updates a visual progress bar and text indicator as the file uploads
* Handles the response or error after the upload completes

## 6. Handling Both Upload and Download Progress

For comprehensive progress tracking, you might want to monitor both upload and download phases:

```javascript
function fetchLargeDataWithProgress(requestData) {
  const config = {
    onUploadProgress: progressEvent => {
      const uploadPercentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log(`Upload Progress: ${uploadPercentage}%`);
      // Update UI for upload phase
      updateUploadProgressUI(uploadPercentage);
    },
    onDownloadProgress: progressEvent => {
      if (progressEvent.lengthComputable) {
        const downloadPercentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Download Progress: ${downloadPercentage}%`);
        // Update UI for download phase
        updateDownloadProgressUI(downloadPercentage);
      } else {
        console.log(`Downloaded ${progressEvent.loaded} bytes`);
        // Update UI with bytes received
        updateDownloadBytesUI(progressEvent.loaded);
      }
    }
  };
  
  return axios.post('https://api.example.com/process-data', requestData, config);
}

// Helper functions to update UI (implementation depends on your UI)
function updateUploadProgressUI(percentage) {
  document.getElementById('upload-progress-bar').style.width = `${percentage}%`;
  document.getElementById('upload-progress-text').textContent = `Uploading: ${percentage}%`;
}

function updateDownloadProgressUI(percentage) {
  document.getElementById('download-progress-bar').style.width = `${percentage}%`;
  document.getElementById('download-progress-text').textContent = `Downloading: ${percentage}%`;
}

function updateDownloadBytesUI(bytes) {
  // Convert bytes to more readable format (KB, MB)
  const formattedSize = formatBytes(bytes);
  document.getElementById('download-progress-text').textContent = `Downloaded: ${formattedSize}`;
}

// Helper function to format bytes into KB, MB, etc.
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
```

This example:

* Tracks both upload and download progress
* Updates different UI elements for each phase
* Includes a helper function to format bytes into more readable units

## 7. Advanced Concepts: Progress Tracking in Axios Instances

When you're working with multiple API endpoints, you might create Axios instances with pre-configured settings. Progress tracking can be applied to these instances as well:

```javascript
// Create a custom Axios instance
const apiClient = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

// Add progress tracking interceptor to all requests
apiClient.interceptors.request.use(config => {
  // Attach default progress handlers if not provided
  if (!config.onUploadProgress) {
    config.onUploadProgress = progressEvent => {
      // Default upload progress handling
      const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log(`Default Upload Progress: ${percentage}%`);
    };
  }
  
  if (!config.onDownloadProgress) {
    config.onDownloadProgress = progressEvent => {
      // Default download progress handling
      if (progressEvent.lengthComputable) {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Default Download Progress: ${percentage}%`);
      }
    };
  }
  
  return config;
});

// Now any request made with this instance will have progress tracking
apiClient.get('/large-data')
  .then(response => console.log('Data received:', response.data))
  .catch(error => console.error('Error:', error));

// You can also override the default handlers for specific requests
apiClient.post('/upload', formData, {
  onUploadProgress: progressEvent => {
    // Custom upload progress handling for this specific request
    const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    console.log(`Custom Upload Progress: ${percentage}%`);
  }
});
```

In this example:

* We create a custom Axios instance with pre-configured settings
* We add request interceptors to automatically attach progress handlers to all requests
* We demonstrate how to override these defaults for specific requests

## 8. Browser Compatibility and Limitations

> It's important to understand that progress tracking has some limitations. Not all browsers and environments support progress events equally, and servers must be properly configured to provide accurate content length information.

Some key limitations to be aware of:

1. **Server Configuration** : For download progress to work properly with `lengthComputable`, the server must include the `Content-Length` header in its response.
2. **Cross-Origin Limitations** : Progress tracking may be limited in cross-origin requests unless the server provides the appropriate CORS headers.
3. **Node.js Environment** : In Node.js, progress tracking works differently since it doesn't use the browser's XMLHttpRequest. Axios uses Node's http module, which has a different event system.

Let's look at a Node.js example:

```javascript
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Stream a large file download in Node.js with progress tracking
async function downloadFileWithProgress(url, destinationPath) {
  // Create a write stream to the destination file
  const writer = fs.createWriteStream(destinationPath);
  
  // Get file info first to know the total size
  const { headers } = await axios.head(url);
  const totalLength = headers['content-length'];
  
  console.log(`Starting download, total size: ${formatBytes(totalLength)}`);
  
  // Download with progress tracking
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
    onDownloadProgress: progressEvent => {
      const percentage = Math.round((progressEvent.loaded * 100) / totalLength);
      process.stdout.write(`\rDownload Progress: ${percentage}% (${formatBytes(progressEvent.loaded)} / ${formatBytes(totalLength)})`);
    }
  });
  
  // Pipe the response stream to the file write stream
  response.data.pipe(writer);
  
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// Usage example
downloadFileWithProgress('https://example.com/large-file.zip', './downloaded-file.zip')
  .then(() => console.log('\nDownload complete!'))
  .catch(error => console.error('\nDownload failed:', error));
```

This Node.js example:

* Creates a write stream to save the downloaded file
* Performs a HEAD request first to get the total file size
* Uses Axios with stream response type for efficient large file handling
* Tracks download progress and updates the console
* Uses a promise to know when the download is complete

## 9. Error Handling During Progress Tracking

When implementing progress tracking, it's important to also handle potential errors properly:

```javascript
function uploadWithProgressAndErrorHandling(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  // Track upload progress state
  let uploadCompleted = false;
  let uploadProgress = 0;
  
  // Create a reference to the request for possible cancellation
  const source = axios.CancelToken.source();
  
  // Setup UI elements
  const progressBar = document.getElementById('progress-bar');
  const statusText = document.getElementById('status-text');
  
  // Reset UI
  progressBar.style.width = '0%';
  statusText.textContent = 'Starting upload...';
  
  const request = axios.post('https://api.example.com/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    cancelToken: source.token,
    onUploadProgress: progressEvent => {
      uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    
      // Update UI
      progressBar.style.width = `${uploadProgress}%`;
      statusText.textContent = `Uploading: ${uploadProgress}%`;
    },
    timeout: 30000 // 30 seconds timeout
  });
  
  // Set up a timeout to monitor for stalled uploads
  const stalledTimer = setTimeout(() => {
    if (!uploadCompleted && uploadProgress < 100 && uploadProgress > 0) {
      statusText.textContent = 'Upload seems to be stalled. You can cancel or continue waiting.';
    
      // Show cancel button
      document.getElementById('cancel-button').style.display = 'block';
    }
  }, 10000); // Check if stalled after 10 seconds
  
  // Cancel button event handler
  document.getElementById('cancel-button').addEventListener('click', () => {
    source.cancel('Upload cancelled by user');
    clearTimeout(stalledTimer);
    statusText.textContent = 'Upload cancelled';
    document.getElementById('cancel-button').style.display = 'none';
  });
  
  return request
    .then(response => {
      uploadCompleted = true;
      clearTimeout(stalledTimer);
      statusText.textContent = 'Upload completed successfully!';
      document.getElementById('cancel-button').style.display = 'none';
      return response.data;
    })
    .catch(error => {
      uploadCompleted = true;
      clearTimeout(stalledTimer);
    
      if (axios.isCancel(error)) {
        // We know this was a user cancellation, already handled
      } else if (error.code === 'ECONNABORTED') {
        statusText.textContent = 'Upload timed out. Please try again.';
      } else if (error.response) {
        // The server responded with an error status code
        statusText.textContent = `Upload failed: Server returned ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        statusText.textContent = 'Upload failed: No response from server';
      } else {
        // Something else happened while setting up the request
        statusText.textContent = 'Upload failed: ' + error.message;
      }
    
      document.getElementById('cancel-button').style.display = 'none';
      throw error; // Re-throw to allow further handling
    });
}
```

This example:

* Implements progress tracking with comprehensive error handling
* Detects stalled uploads and provides a cancel option
* Utilizes Axios's CancelToken for request cancellation
* Provides meaningful error messages based on the type of error
* Cleans up timers and UI elements appropriately

## 10. Progress Tracking with Multiple Simultaneous Requests

For applications that need to track progress across multiple requests, we can implement a more sophisticated solution:

```javascript
class BatchUploader {
  constructor() {
    this.uploads = new Map(); // Store upload info by ID
    this.totalProgress = 0;    // Overall progress
    this.activeUploads = 0;    // Count of active uploads
  }
  
  // Add a file to the batch
  addFile(id, file) {
    this.uploads.set(id, {
      file,
      progress: 0,
      status: 'pending',
      error: null
    });
    return this;
  }
  
  // Start uploading all files
  async uploadAll(onProgressUpdate) {
    this.activeUploads = this.uploads.size;
  
    // Create an array of upload promises
    const uploadPromises = Array.from(this.uploads.entries()).map(([id, upload]) => {
      return this.uploadFile(id, upload.file, progress => {
        // Update individual file progress
        const fileInfo = this.uploads.get(id);
        fileInfo.progress = progress;
      
        // Recalculate total progress
        this.updateTotalProgress();
      
        // Call the progress callback
        if (typeof onProgressUpdate === 'function') {
          onProgressUpdate(this.totalProgress, this.getDetailedStatus());
        }
      });
    });
  
    // Wait for all uploads to complete
    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      // Even if some uploads fail, we'll still have the individual statuses
      console.error('Some uploads failed:', error);
      return this.getDetailedStatus();
    }
  }
  
  // Upload a single file
  async uploadFile(id, file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const upload = this.uploads.get(id);
      upload.status = 'uploading';
    
      const response = await axios.post('https://api.example.com/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (typeof onProgress === 'function') {
            onProgress(progress);
          }
        }
      });
    
      // Update status on completion
      upload.status = 'completed';
      upload.progress = 100;
      this.activeUploads--;
    
      return {
        id,
        result: response.data,
        status: 'completed'
      };
    } catch (error) {
      // Update status on error
      const upload = this.uploads.get(id);
      upload.status = 'failed';
      upload.error = error.message || 'Unknown error';
      this.activeUploads--;
    
      throw {
        id,
        error: upload.error,
        status: 'failed'
      };
    }
  }
  
  // Calculate total progress across all files
  updateTotalProgress() {
    let totalProgress = 0;
  
    this.uploads.forEach(upload => {
      totalProgress += upload.progress;
    });
  
    this.totalProgress = Math.round(totalProgress / this.uploads.size);
  }
  
  // Get detailed status of all uploads
  getDetailedStatus() {
    const status = {
      total: {
        progress: this.totalProgress,
        completed: 0,
        failed: 0,
        pending: 0,
        uploading: 0
      },
      files: {}
    };
  
    this.uploads.forEach((upload, id) => {
      status.files[id] = {
        progress: upload.progress,
        status: upload.status,
        error: upload.error
      };
    
      // Update counters
      status.total[upload.status]++;
    });
  
    return status;
  }
}

// Usage example
const batchUploader = new BatchUploader();

// Add files from a file input
document.getElementById('file-input').addEventListener('change', event => {
  const files = event.target.files;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    batchUploader.addFile(`file-${i}`, file);
  }
});

// Start uploads with progress tracking
document.getElementById('upload-button').addEventListener('click', async () => {
  try {
    // Start the upload with a progress callback
    await batchUploader.uploadAll((totalProgress, detailedStatus) => {
      // Update UI with progress
      document.getElementById('total-progress-bar').style.width = `${totalProgress}%`;
      document.getElementById('total-progress-text').textContent = `Overall Progress: ${totalProgress}%`;
    
      // Update individual file progress indicators
      Object.entries(detailedStatus.files).forEach(([id, fileStatus]) => {
        const fileElement = document.getElementById(`file-${id}-progress`);
        if (fileElement) {
          fileElement.style.width = `${fileStatus.progress}%`;
        
          const statusElement = document.getElementById(`file-${id}-status`);
          if (statusElement) {
            statusElement.textContent = `${fileStatus.status} (${fileStatus.progress}%)`;
          }
        }
      });
    
      // Update status summary
      document.getElementById('status-summary').textContent = 
        `Completed: ${detailedStatus.total.completed} | ` +
        `Failed: ${detailedStatus.total.failed} | ` +
        `In Progress: ${detailedStatus.total.uploading} | ` +
        `Pending: ${detailedStatus.total.pending}`;
    });
  
    console.log('All uploads completed!');
  } catch (error) {
    console.error('Upload batch had errors:', error);
  }
});
```

This complex example:

* Creates a `BatchUploader` class to manage multiple file uploads
* Tracks individual and total progress
* Provides detailed status information for each file
* Updates UI elements with progress information
* Handles errors for individual files without stopping the entire batch

## 11. Conclusion: Best Practices for Progress Tracking

> Progress tracking is a powerful feature that can significantly enhance the user experience, especially when dealing with large files or time-consuming operations. When implemented correctly, it provides users with valuable feedback and reduces perceived waiting time.

Based on our exploration, here are some best practices for implementing progress tracking with Axios:

1. **Always check for `lengthComputable`** before calculating percentages in download progress tracking.
2. **Provide fallback information** when exact percentages cannot be calculated.
3. **Consider both upload and download phases** for comprehensive progress tracking.
4. **Implement proper error handling** and timeout detection.
5. **Use appropriate UI patterns** like progress bars, spinners, or textual indicators based on the context.
6. **Be mindful of browser compatibility** and server configuration requirements.
7. **For large files, consider chunked uploads** with individual progress tracking for each chunk.
8. **Implement cancel functionality** to allow users to abort long-running operations.

By implementing these practices, you can create robust progress tracking for your Axios requests, providing users with a more transparent and responsive experience in your web applications.
