
## Understanding Encryption/Decryption Fundamentals

Before we dive into Node.js specifics, let's establish what encryption and decryption actually mean at their core:

> **Encryption** is the process of transforming readable data (plaintext) into an unreadable format (ciphertext) to protect information from unauthorized access.

> **Decryption** is the reverse process - converting the unreadable ciphertext back into its original plaintext form.

Think of encryption like putting your message in a locked box: only someone with the right key can open it and read what's inside.

### The Two Main Types of Encryption

There are two fundamental approaches to encryption:

1. **Symmetric Encryption** : Uses the same key for both encryption and decryption
2. **Asymmetric Encryption** : Uses a pair of keys - one public and one private

For this guide, we'll focus primarily on symmetric encryption as it's more commonly used in custom utilities.

## Getting Started with Node.js Crypto Module

Node.js comes with a built-in `crypto` module that provides cryptographic functionality. This module is our foundation for building custom encryption utilities.

Here's how we begin:

```javascript
// Importing the crypto module
const crypto = require('crypto');

// This module gives us access to various cryptographic functions
// including encryption, hashing, and random number generation
```

Let me explain what's happening here: The `crypto` module is a core Node.js module, meaning it's built into Node.js itself. You don't need to install it separately - it's available whenever you run Node.js.

## Building Your First Simple Encryption Function

Let's create a basic encryption function to understand the core concepts:

```javascript
const crypto = require('crypto');

function simpleEncrypt(text, password) {
    // Create a cipher using AES-256-CTR algorithm
    const algorithm = 'aes-256-ctr';
  
    // Generate a secret key from the password
    const key = crypto.scryptSync(password, 'salt', 32);
  
    // Create a random initialization vector
    const iv = crypto.randomBytes(16);
  
    // Create the cipher
    const cipher = crypto.createCipheriv(algorithm, key, iv);
  
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
  
    // Return both the IV and encrypted data
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted
    };
}
```

Let me break down every step:

1. **Algorithm Selection** : We're using 'aes-256-ctr', which is:

* AES (Advanced Encryption Standard) - the encryption algorithm
* 256 - the key size in bits (very secure)
* CTR - Counter mode (a way of applying the algorithm)

1. **Key Derivation** : `crypto.scryptSync()` converts our password into a proper encryption key:

* Takes a password and a salt (here we use 'salt' - in production, use a random salt)
* Generates a 32-byte key suitable for AES-256

1. **Initialization Vector (IV)** : `crypto.randomBytes(16)` creates a random IV:

* The IV ensures the same message encrypted twice produces different results
* It's like adding randomness to make encryption unpredictable

1. **Creating the Cipher** : `crypto.createCipheriv()` sets up our encryption engine
2. **Encryption Process** :

* `cipher.update()` encrypts the main text
* `cipher.final()` processes any remaining data
* We convert everything to hexadecimal for easy storage/transmission

## Creating the Corresponding Decryption Function

Now let's create the decryption function that reverses our encryption:

```javascript
function simpleDecrypt(encryptedData, password, iv) {
    const algorithm = 'aes-256-ctr';
  
    // Recreate the key from the password
    const key = crypto.scryptSync(password, 'salt', 32);
  
    // Convert IV from hex back to Buffer
    const ivBuffer = Buffer.from(iv, 'hex');
  
    // Create the decipher
    const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
  
    // Decrypt the data
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
  
    return decrypted;
}
```

Here's what's happening in the decryption process:

1. We recreate the exact same key using the same password and salt
2. We convert the IV from its stored hex format back to a Buffer
3. We create a decipher (the opposite of cipher) with the same parameters
4. We reverse the encryption process to get back our original text

## Testing Our Basic Functions

Let's test these functions to see them in action:

```javascript
// Test our encryption/decryption
const originalMessage = "This is my secret message!";
const password = "my-secret-password-123";

// Encrypt the message
const encrypted = simpleEncrypt(originalMessage, password);
console.log("Encrypted data:", encrypted);

// Decrypt the message
const decrypted = simpleDecrypt(
    encrypted.encryptedData, 
    password, 
    encrypted.iv
);
console.log("Decrypted message:", decrypted);
console.log("Matches original?", decrypted === originalMessage);
```

When you run this, you'll see:

* The encrypted data is completely unreadable
* Each run produces different encrypted output (thanks to the random IV)
* The decryption perfectly restores the original message

## Building a More Robust Encryption Utility

Now let's create a more production-ready utility that handles common real-world requirements:

```javascript
class EncryptionUtility {
    constructor() {
        this.algorithm = 'aes-256-gcm'; // Using GCM mode for authentication
        this.keyLength = 32;
        this.ivLength = 12; // GCM uses 12-byte IV
        this.saltLength = 16;
        this.tagLength = 16;
    }
  
    // Generate a cryptographically secure random salt
    generateSalt() {
        return crypto.randomBytes(this.saltLength);
    }
  
    // Derive a key from password using PBKDF2
    deriveKey(password, salt, iterations = 100000) {
        return crypto.pbkdf2Sync(
            password, 
            salt, 
            iterations, 
            this.keyLength, 
            'sha256'
        );
    }
  
    encrypt(plaintext, password) {
        try {
            // Generate random salt and IV
            const salt = this.generateSalt();
            const iv = crypto.randomBytes(this.ivLength);
          
            // Derive key from password
            const key = this.deriveKey(password, salt);
          
            // Create cipher
            const cipher = crypto.createCipheriv(this.algorithm, key, iv);
          
            // Encrypt the data
            let encrypted = cipher.update(plaintext, 'utf8', 'hex');
            encrypted += cipher.final('hex');
          
            // Get the authentication tag (important for GCM mode)
            const authTag = cipher.getAuthTag();
          
            // Combine all components
            return {
                encrypted,
                salt: salt.toString('hex'),
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex')
            };
        } catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }
  
    decrypt(encryptedData, password) {
        try {
            // Extract components
            const { encrypted, salt, iv, authTag } = encryptedData;
          
            // Convert from hex to Buffers
            const saltBuffer = Buffer.from(salt, 'hex');
            const ivBuffer = Buffer.from(iv, 'hex');
            const authTagBuffer = Buffer.from(authTag, 'hex');
          
            // Derive the same key
            const key = this.deriveKey(password, saltBuffer);
          
            // Create decipher
            const decipher = crypto.createDecipheriv(this.algorithm, key, ivBuffer);
          
            // Set the authentication tag (crucial for verification)
            decipher.setAuthTag(authTagBuffer);
          
            // Decrypt
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
          
            return decrypted;
        } catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }
}
```

### Key Improvements Explained

Let me explain the improvements in this robust version:

1. **GCM Mode (Galois/Counter Mode)** :

* Provides both encryption and authentication
* Prevents tampering with encrypted data
* More secure than CTR mode

1. **Random Salt per Encryption** :

* Each encryption generates its own unique salt
* Prevents rainbow table attacks
* Makes brute-force attacks much harder

1. **PBKDF2 Key Derivation** :

* More secure than scrypt for password-based encryption
* Uses many iterations (100,000) to slow down brute-force attacks
* SHA-256 as the underlying hash function

1. **Authentication Tag** :

* Ensures data hasn't been modified
* Decryption will fail if data has been tampered with
* Critical security feature for production use

## Using the Robust Utility

Here's how to use our improved encryption utility:

```javascript
// Create an instance of our utility
const encryptionUtil = new EncryptionUtility();

// Example data to encrypt
const sensitiveData = "My credit card number is 1234-5678-9012-3456";
const password = "my-very-secure-password-2024";

try {
    // Encrypt the data
    const encrypted = encryptionUtil.encrypt(sensitiveData, password);
    console.log("Encrypted package:", encrypted);
  
    // Decrypt the data
    const decrypted = encryptionUtil.decrypt(encrypted, password);
    console.log("Decrypted data:", decrypted);
  
    // Verify integrity
    console.log("Data integrity verified:", decrypted === sensitiveData);
  
} catch (error) {
    console.error("Error:", error.message);
}
```

## Advanced: File Encryption Utility

Let's create a utility that can encrypt and decrypt entire files:

```javascript
const fs = require('fs');
const path = require('path');

class FileEncryption extends EncryptionUtility {
    async encryptFile(inputPath, outputPath, password) {
        try {
            // Read the file
            const fileBuffer = await fs.promises.readFile(inputPath);
          
            // Encrypt the content
            const encryptedData = this.encrypt(fileBuffer.toString('base64'), password);
          
            // Save encrypted data as JSON
            await fs.promises.writeFile(
                outputPath, 
                JSON.stringify(encryptedData, null, 2)
            );
          
            console.log(`File encrypted successfully: ${outputPath}`);
            return true;
        } catch (error) {
            console.error(`File encryption failed: ${error.message}`);
            return false;
        }
    }
  
    async decryptFile(inputPath, outputPath, password) {
        try {
            // Read the encrypted file
            const encryptedContent = await fs.promises.readFile(inputPath, 'utf8');
            const encryptedData = JSON.parse(encryptedContent);
          
            // Decrypt the content
            const decryptedBase64 = this.decrypt(encryptedData, password);
          
            // Convert from base64 back to buffer
            const decryptedBuffer = Buffer.from(decryptedBase64, 'base64');
          
            // Save the decrypted file
            await fs.promises.writeFile(outputPath, decryptedBuffer);
          
            console.log(`File decrypted successfully: ${outputPath}`);
            return true;
        } catch (error) {
            console.error(`File decryption failed: ${error.message}`);
            return false;
        }
    }
}
```

## Using the File Encryption Utility

Here's how to encrypt and decrypt files:

```javascript
async function demonstrateFileEncryption() {
    const fileEncryption = new FileEncryption();
    const password = "my-file-encryption-password";
  
    // Paths for our example
    const originalFile = "original-document.txt";
    const encryptedFile = "document.encrypted";
    const decryptedFile = "decrypted-document.txt";
  
    try {
        // Create a test file
        await fs.promises.writeFile(originalFile, "This is sensitive document content!");
      
        // Encrypt the file
        await fileEncryption.encryptFile(originalFile, encryptedFile, password);
      
        // Decrypt the file
        await fileEncryption.decryptFile(encryptedFile, decryptedFile, password);
      
        // Verify the content
        const originalContent = await fs.promises.readFile(originalFile, 'utf8');
        const decryptedContent = await fs.promises.readFile(decryptedFile, 'utf8');
      
        console.log("File encryption/decryption successful:", originalContent === decryptedContent);
      
    } catch (error) {
        console.error("Demonstration failed:", error.message);
    }
}

// Run the demonstration
demonstrateFileEncryption();
```

## Understanding Stream-Based Encryption

For very large files, loading everything into memory isn't practical. Here's a stream-based approach:

```javascript
const { Transform } = require('stream');

class EncryptionStream extends Transform {
    constructor(password, options = {}) {
        super(options);
      
        this.algorithm = 'aes-256-ctr';
      
        // Generate salt and IV
        this.salt = crypto.randomBytes(16);
        this.iv = crypto.randomBytes(16);
      
        // Derive key
        this.key = crypto.pbkdf2Sync(password, this.salt, 100000, 32, 'sha256');
      
        // Create cipher
        this.cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
      
        // Flag to track if we've sent metadata
        this.metadataSent = false;
    }
  
    _transform(chunk, encoding, callback) {
        try {
            // Send metadata (salt and IV) at the beginning
            if (!this.metadataSent) {
                const metadata = Buffer.concat([
                    this.salt,
                    this.iv,
                    Buffer.from('---DATA---') // Separator
                ]);
                this.push(metadata);
                this.metadataSent = true;
            }
          
            // Encrypt the chunk
            const encryptedChunk = this.cipher.update(chunk);
            this.push(encryptedChunk);
          
            callback();
        } catch (error) {
            callback(error);
        }
    }
  
    _flush(callback) {
        try {
            // Finalize encryption
            const finalChunk = this.cipher.final();
            this.push(finalChunk);
            callback();
        } catch (error) {
            callback(error);
        }
    }
}
```

Using the stream-based encryption for large files:

```javascript
function encryptLargeFile(inputPath, outputPath, password) {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(inputPath);
        const writeStream = fs.createWriteStream(outputPath);
        const encryptStream = new EncryptionStream(password);
      
        // Pipe the streams together
        readStream
            .pipe(encryptStream)
            .pipe(writeStream)
            .on('finish', () => {
                console.log('Large file encrypted successfully');
                resolve();
            })
            .on('error', reject);
    });
}
```

## Best Practices and Security Considerations

Let me share important security considerations:

> **Always Use Unique Salts** : Never reuse salts between encryptions. Each encryption should generate its own random salt.

> **Strong Key Derivation** : Use PBKDF2 or Argon2 with high iteration counts (minimum 100,000 for PBKDF2).

> **Authenticated Encryption** : Always use modes like GCM that provide both confidentiality and authenticity.

> **Secure Random Number Generation** : Use `crypto.randomBytes()` for all random values (salts, IVs, etc.).

Here's a comprehensive example showing all best practices:

```javascript
class SecureEncryptionUtility {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.keyDerivation = 'pbkdf2';
        this.hashAlgorithm = 'sha512';
        this.iterations = 150000; // Increased for better security
    }
  
    // Validate input before encryption
    validateInput(plaintext, password) {
        if (!plaintext || !password) {
            throw new Error('Both plaintext and password are required');
        }
        if (password.length < 12) {
            throw new Error('Password must be at least 12 characters long');
        }
        return true;
    }
  
    encrypt(plaintext, password) {
        // Validate inputs
        this.validateInput(plaintext, password);
      
        // Generate cryptographically secure random values
        const salt = crypto.randomBytes(32);
        const iv = crypto.randomBytes(12);
      
        // Derive key with high iteration count
        const key = crypto.pbkdf2Sync(
            password,
            salt,
            this.iterations,
            32,
            this.hashAlgorithm
        );
      
        // Create cipher with GCM mode
        const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
        // Encrypt
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
      
        // Get authentication tag
        const authTag = cipher.getAuthTag();
      
        // Return all components needed for decryption
        return {
            encrypted,
            salt: salt.toString('hex'),
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
            algorithm: this.algorithm,
            iterations: this.iterations,
            keyDerivation: this.keyDerivation,
            hashAlgorithm: this.hashAlgorithm
        };
    }
  
    decrypt(encryptedPackage, password) {
        // Extract all components
        const {
            encrypted,
            salt,
            iv,
            authTag,
            algorithm,
            iterations,
            keyDerivation,
            hashAlgorithm
        } = encryptedPackage;
      
        // Verify algorithm compatibility
        if (algorithm !== this.algorithm) {
            throw new Error('Algorithm mismatch');
        }
      
        // Convert from hex
        const saltBuffer = Buffer.from(salt, 'hex');
        const ivBuffer = Buffer.from(iv, 'hex');
        const authTagBuffer = Buffer.from(authTag, 'hex');
      
        // Derive key with stored parameters
        const key = crypto.pbkdf2Sync(
            password,
            saltBuffer,
            iterations,
            32,
            hashAlgorithm
        );
      
        // Create decipher
        const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
        decipher.setAuthTag(authTagBuffer);
      
        // Decrypt
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
      
        return decrypted;
    }
}
```

## Wrapping Up: Creating Your Encryption Library

Finally, let's create a complete encryption library that can be easily used in any Node.js project:

```javascript
// encryption-library.js
const crypto = require('crypto');

class CryptoUtils {
    static encrypt(data, password, options = {}) {
        const utility = new SecureEncryptionUtility();
        return utility.encrypt(data, password);
    }
  
    static decrypt(encryptedPackage, password) {
        const utility = new SecureEncryptionUtility();
        return utility.decrypt(encryptedPackage, password);
    }
  
    static encryptFile(inputPath, outputPath, password) {
        const fileUtility = new FileEncryption();
        return fileUtility.encryptFile(inputPath, outputPath, password);
    }
  
    static decryptFile(inputPath, outputPath, password) {
        const fileUtility = new FileEncryption();
        return fileUtility.decryptFile(inputPath, outputPath, password);
    }
  
    static generateRandomPassword(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
  
    static hash(data, algorithm = 'sha256') {
        return crypto.createHash(algorithm).update(data).digest('hex');
    }
}

module.exports = CryptoUtils;
```

Using the library is now simple:

```javascript
const CryptoUtils = require('./encryption-library');

// Encrypt some data
const encrypted = CryptoUtils.encrypt("My secret data", "my-password");

// Decrypt it
const decrypted = CryptoUtils.decrypt(encrypted, "my-password");

// Generate a secure password
const newPassword = CryptoUtils.generateRandomPassword();

// Hash some data
const hash = CryptoUtils.hash("data to hash");
```

## Conclusion

You've now learned how to build custom encryption/decryption utilities in Node.js from first principles. We covered:

* Basic concepts of encryption and decryption
* Using Node.js crypto module
* Creating simple encryption functions
* Building robust, production-ready utilities
* Handling file encryption
* Stream-based encryption for large files
* Security best practices
* Creating a reusable encryption library

Remember, security is critical when working with encryption. Always:

* Use established algorithms and modes
* Generate strong, random salts and IVs
* Use sufficient iterations for key derivation
* Validate inputs and handle errors properly
* Keep your libraries updated

With these foundations, you can now create secure encryption utilities tailored to your specific needs while understanding exactly how they work under the hood.
