
## What is Cryptographic Key Management?

At its core, key management is the practice of handling digital "keys" - random strings of data that enable encryption and decryption operations. Just as you wouldn't leave your house key under a doormat, digital keys require careful protection and management throughout their lifecycle.

### The First Principle: Keys are Secrets

> **Key Insight** : Cryptographic keys are essentially secrets that must be protected at all costs. Their security directly determines the security of everything they protect.

Every key management pattern stems from this simple truth. Let's build up from here.

## The Lifecycle of Cryptographic Keys

Keys don't just exist - they have a complete lifecycle:

1. **Generation** : Creating random, unpredictable keys
2. **Storage** : Keeping keys safe when not in use
3. **Distribution** : Sharing keys with authorized parties
4. **Usage** : Using keys for encryption/decryption operations
5. **Rotation** : Periodically changing keys for security
6. **Revocation** : Invalidating compromised keys
7. **Destruction** : Securely deleting keys when no longer needed

Let's explore each of these concepts with Node.js examples.

## Key Generation: The Foundation

The first principle of key generation is  **true randomness** . Predictable keys are useless.

```javascript
const crypto = require('crypto');

// Generate a 256-bit (32-byte) key for AES-256
function generateSecretKey() {
    return crypto.randomBytes(32);
}

// Example usage
const secretKey = generateSecretKey();
console.log('New secret key:', secretKey.toString('hex'));
// Output: New secret key: a7d9f8e6c4b3a2d9f8e6c4b3a2d9f8e6c4b3a2d9f8e6c4b3a2d9f8e6c4b3a2d9
```

This code uses Node.js's `crypto.randomBytes()` which leverages the operating system's cryptographically secure random number generator. The number 32 comes from AES-256's requirement for a 256-bit key (256 ÷ 8 = 32 bytes).

### Understanding Key Size

Different algorithms require different key sizes:

```javascript
// AES key sizes (in bytes)
const AES_128_KEY_SIZE = 16;  // 128 bits ÷ 8
const AES_192_KEY_SIZE = 24;  // 192 bits ÷ 8  
const AES_256_KEY_SIZE = 32;  // 256 bits ÷ 8

// Generate keys for different AES modes
function generateAESKey(keySize = AES_256_KEY_SIZE) {
    if (![16, 24, 32].includes(keySize)) {
        throw new Error('Invalid AES key size');
    }
    return crypto.randomBytes(keySize);
}

// RSA key generation (asymmetric)
function generateRSAKeyPair() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,  // Key size in bits
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
  
    return { privateKey, publicKey };
}
```

The `generateKeyPairSync` function creates an RSA key pair - a mathematical relationship between two keys where one can encrypt data that only the other can decrypt.

## Storage Patterns: Protecting Keys at Rest

> **Critical Principle** : Never store keys in plain text or in your source code. Your keys need their own security layer.

### Pattern 1: Environment Variables (Simple but Limited)

```javascript
require('dotenv').config();

// Read key from environment
function getKeyFromEnv() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY not found in environment');
    }
  
    // Convert from hex string back to buffer
    return Buffer.from(key, 'hex');
}

// Usage
const key = getKeyFromEnv();
```

Create a `.env` file (NEVER commit this to source control):

```
ENCRYPTION_KEY=a7d9f8e6c4b3a2d9f8e6c4b3a2d9f8e6c4b3a2d9f8e6c4b3a2d9f8e6c4b3a2d9
```

This pattern works for development but has limitations in production.

### Pattern 2: Key Derivation Functions (KDF)

Instead of storing raw keys, store a password and derive keys from it:

```javascript
const crypto = require('crypto');

// Derive a key from a password using PBKDF2
function deriveKey(password, salt, keyLength = 32) {
    // PBKDF2 with SHA-256, 100,000 iterations
    return crypto.pbkdf2Sync(
        password,
        salt,
        100000,      // Iteration count (adjust based on security needs)
        keyLength,   // Output key length
        'sha256'     // Hash algorithm
    );
}

// Example usage
const password = 'user-provided-password';
const salt = crypto.randomBytes(16);  // Always generate new salt for each key

const derivedKey = deriveKey(password, salt);
console.log('Derived key:', derivedKey.toString('hex'));
console.log('Salt (store this too):', salt.toString('hex'));
```

The salt must be stored alongside the derived key to regenerate it later. The iteration count (100,000) makes brute force attacks more expensive.

### Pattern 3: Hardware Security Modules (HSM) Integration

For production systems, keys often live in specialized hardware:

```javascript
// Simulated HSM interface
class SimpleHSMInterface {
    constructor() {
        this.keys = new Map();  // Simulating secure storage
    }
  
    // Generate and store a key
    generateKey(keyId, algorithm = 'aes-256-gcm') {
        if (this.keys.has(keyId)) {
            throw new Error(`Key ${keyId} already exists`);
        }
      
        const key = crypto.randomBytes(32);
        this.keys.set(keyId, { algorithm, key });
      
        // In real HSM, key never leaves the device
        return keyId;  // Return only the reference
    }
  
    // Use a key for encryption (key never leaves HSM)
    encrypt(keyId, data) {
        const keyInfo = this.keys.get(keyId);
        if (!keyInfo) {
            throw new Error(`Key ${keyId} not found`);
        }
      
        const cipher = crypto.createCipher(keyInfo.algorithm, keyInfo.key);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
      
        return encrypted;
    }
}

// Usage
const hsm = new SimpleHSMInterface();
const keyId = hsm.generateKey('app-key-001');
const encryptedData = hsm.encrypt(keyId, 'sensitive information');
```

In real HSM implementations, private keys never leave the secure hardware boundary, providing the highest level of protection.

## Distribution Patterns: Sharing Keys Securely

When multiple parties need to use the same key, distribution becomes crucial.

### Pattern 1: Key Exchange Protocols

```javascript
// Simplified Diffie-Hellman key exchange
class DHKeyExchange {
    constructor() {
        // Public parameters (can be shared openly)
        this.p = BigInt('0xFFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AACAA68FFFFFFFFFFFFFFFF');
        this.g = BigInt(2);
    }
  
    // Each party generates their private key
    generatePrivateKey() {
        // Random number less than p-1
        const randomBytes = crypto.randomBytes(32);
        return BigInt('0x' + randomBytes.toString('hex')) % (this.p - BigInt(1)) + BigInt(1);
    }
  
    // Calculate public key from private key
    calculatePublicKey(privateKey) {
        // public = g^private mod p
        return this.modPow(this.g, privateKey, this.p);
    }
  
    // Calculate shared secret
    calculateSharedSecret(otherPublicKey, myPrivateKey) {
        // shared = otherPublic^myPrivate mod p
        return this.modPow(otherPublicKey, myPrivateKey, this.p);
    }
  
    // Modular exponentiation
    modPow(base, exponent, modulus) {
        if (modulus === BigInt(1)) return BigInt(0);
        let result = BigInt(1);
        base = base % modulus;
        while (exponent > BigInt(0)) {
            if (exponent % BigInt(2) === BigInt(1)) {
                result = (result * base) % modulus;
            }
            exponent = exponent / BigInt(2);
            base = (base * base) % modulus;
        }
        return result;
    }
}

// Usage example
const dh = new DHKeyExchange();

// Alice's side
const alicePrivate = dh.generatePrivateKey();
const alicePublic = dh.calculatePublicKey(alicePrivate);

// Bob's side
const bobPrivate = dh.generatePrivateKey();
const bobPublic = dh.calculatePublicKey(bobPrivate);

// Both parties can now calculate the same shared secret
const aliceShared = dh.calculateSharedSecret(bobPublic, alicePrivate);
const bobShared = dh.calculateSharedSecret(alicePublic, bobPrivate);

console.log('Secrets match:', aliceShared === bobShared);
```

This Diffie-Hellman implementation allows two parties to establish a shared secret without ever transmitting the secret itself.

### Pattern 2: Key Wrapping

Wrap one key with another for secure transmission:

```javascript
// Key wrapping using AES-KW (Key Wrap)
class KeyWrapper {
    constructor(kek) {  // Key Encryption Key
        this.kek = kek;
    }
  
    // Wrap a key for transmission
    wrapKey(keyToWrap) {
        // Using AES-256-GCM for key wrapping
        const cipher = crypto.createCipher('aes-256-gcm', this.kek);
      
        let wrapped = cipher.update(keyToWrap, null, 'hex');
        wrapped += cipher.final('hex');
      
        // Get the authentication tag
        const authTag = cipher.getAuthTag();
      
        // Combine wrapped key and auth tag
        return {
            wrappedKey: wrapped,
            authTag: authTag.toString('hex')
        };
    }
  
    // Unwrap a received key
    unwrapKey(wrappedKey, authTag) {
        const decipher = crypto.createDecipher('aes-256-gcm', this.kek);
      
        // Set the authentication tag
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
        let unwrapped = decipher.update(wrappedKey, 'hex', null);
        unwrapped = Buffer.concat([unwrapped, decipher.final()]);
      
        return unwrapped;
    }
}

// Example usage
const kek = crypto.randomBytes(32);  // Key Encryption Key
const wrapper = new KeyWrapper(kek);

// Key to be shared securely
const dataKey = crypto.randomBytes(32);

// Wrap the key
const { wrappedKey, authTag } = wrapper.wrapKey(dataKey);

// This wrapped key can be safely transmitted
console.log('Wrapped key:', wrappedKey);

// Receiver unwraps the key
const unwrappedKey = wrapper.unwrapKey(wrappedKey, authTag);
console.log('Keys match:', Buffer.compare(dataKey, unwrappedKey) === 0);
```

Key wrapping allows you to encrypt one key with another, enabling secure transmission over insecure channels.

## Key Rotation: Maintaining Security Over Time

> **Security Principle** : Keys should have limited lifespans. Regular rotation minimizes the impact of potential compromise.

### Pattern 1: Automatic Key Rotation

```javascript
class KeyRotationManager {
    constructor() {
        this.keys = new Map();
        this.currentKeyId = null;
        this.rotationInterval = 24 * 60 * 60 * 1000; // 24 hours
        this.startRotation();
    }
  
    // Generate a new key and make it current
    rotateKey() {
        const newKeyId = Date.now().toString();
        const newKey = crypto.randomBytes(32);
      
        // Store the new key
        this.keys.set(newKeyId, {
            key: newKey,
            createdAt: new Date(),
            status: 'active'
        });
      
        // Mark old key for decryption only
        if (this.currentKeyId) {
            const oldKey = this.keys.get(this.currentKeyId);
            if (oldKey) {
                oldKey.status = 'decrypt-only';
            }
        }
      
        // Update current key
        this.currentKeyId = newKeyId;
      
        console.log(`Key rotated. New key ID: ${newKeyId}`);
        return newKeyId;
    }
  
    // Get current key for encryption
    getCurrentKey() {
        if (!this.currentKeyId) {
            throw new Error('No current key available');
        }
      
        const keyInfo = this.keys.get(this.currentKeyId);
        if (keyInfo.status !== 'active') {
            throw new Error('Current key is not active');
        }
      
        return {
            keyId: this.currentKeyId,
            key: keyInfo.key
        };
    }
  
    // Get any key for decryption
    getKeyForDecryption(keyId) {
        const keyInfo = this.keys.get(keyId);
        if (!keyInfo) {
            throw new Error(`Key ${keyId} not found`);
        }
      
        if (keyInfo.status === 'revoked') {
            throw new Error(`Key ${keyId} has been revoked`);
        }
      
        return keyInfo.key;
    }
  
    // Start automatic rotation
    startRotation() {
        // Rotate immediately if no key exists
        if (!this.currentKeyId) {
            this.rotateKey();
        }
      
        // Schedule regular rotation
        setInterval(() => {
            this.rotateKey();
        }, this.rotationInterval);
    }
  
    // Manually revoke a key
    revokeKey(keyId) {
        const keyInfo = this.keys.get(keyId);
        if (!keyInfo) {
            throw new Error(`Key ${keyId} not found`);
        }
      
        keyInfo.status = 'revoked';
        console.log(`Key ${keyId} revoked`);
    }
}

// Usage example
const keyManager = new KeyRotationManager();

// Encrypt data with current key
function encryptData(data) {
    const { keyId, key } = keyManager.getCurrentKey();
  
    const cipher = crypto.createCipheriv('aes-256-gcm', key, crypto.randomBytes(12));
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
  
    return {
        keyId: keyId,
        ciphertext: encrypted,
        authTag: cipher.getAuthTag().toString('hex'),
        iv: cipher.iv.toString('hex')
    };
}

// Decrypt data with appropriate key
function decryptData({ keyId, ciphertext, authTag, iv }) {
    const key = keyManager.getKeyForDecryption(keyId);
  
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
  
    return decrypted;
}
```

This key rotation manager automatically rotates keys while maintaining the ability to decrypt data encrypted with older keys.

## Complete Key Management Example

Let's put everything together in a comprehensive key management system:

```javascript
const crypto = require('crypto');
const EventEmitter = require('events');

class ComprehensiveKeyManager extends EventEmitter {
    constructor(config = {}) {
        super();
      
        this.config = {
            rotationInterval: config.rotationInterval || 24 * 60 * 60 * 1000,
            keySize: config.keySize || 32,
            maxKeyAge: config.maxKeyAge || 30 * 24 * 60 * 60 * 1000, // 30 days
            ...config
        };
      
        this.keys = new Map();
        this.currentKeyId = null;
        this.isRotating = false;
      
        // Initialize
        this.init();
    }
  
    async init() {
        // Generate initial key
        await this.rotateKey();
      
        // Start automatic rotation
        this.startAutoRotation();
      
        // Start key cleanup
        this.startKeyCleanup();
      
        this.emit('initialized');
    }
  
    async generateKey() {
        const keyId = this.generateKeyId();
        const key = crypto.randomBytes(this.config.keySize);
      
        const keyInfo = {
            id: keyId,
            key: key,
            createdAt: Date.now(),
            status: 'active',
            algorithm: 'aes-256-gcm',
            usage: {
                encryptions: 0,
                decryptions: 0
            }
        };
      
        this.keys.set(keyId, keyInfo);
        this.emit('keyGenerated', keyId);
      
        return keyInfo;
    }
  
    async rotateKey() {
        if (this.isRotating) {
            return;
        }
      
        this.isRotating = true;
      
        try {
            // Generate new key
            const newKeyInfo = await this.generateKey();
          
            // Update old key status
            if (this.currentKeyId) {
                const oldKey = this.keys.get(this.currentKeyId);
                if (oldKey) {
                    oldKey.status = 'decrypt-only';
                    this.emit('keyStatusChanged', oldKey.id, 'decrypt-only');
                }
            }
          
            // Set as current
            this.currentKeyId = newKeyInfo.id;
            this.emit('keyRotated', newKeyInfo.id);
          
        } finally {
            this.isRotating = false;
        }
    }
  
    generateKeyId() {
        const timestamp = Date.now();
        const random = crypto.randomBytes(8).toString('hex');
        return `key_${timestamp}_${random}`;
    }
  
    startAutoRotation() {
        setInterval(async () => {
            try {
                await this.rotateKey();
            } catch (error) {
                this.emit('error', error);
            }
        }, this.config.rotationInterval);
    }
  
    startKeyCleanup() {
        // Clean up old keys periodically
        setInterval(() => {
            const now = Date.now();
          
            for (const [keyId, keyInfo] of this.keys.entries()) {
                const age = now - keyInfo.createdAt;
              
                if (age > this.config.maxKeyAge && keyInfo.status !== 'active') {
                    // Permanently delete old keys
                    this.keys.delete(keyId);
                    this.emit('keyDeleted', keyId);
                }
            }
        }, 60 * 60 * 1000); // Check every hour
    }
  
    async encrypt(plaintext) {
        if (!this.currentKeyId) {
            throw new Error('No active key available');
        }
      
        const keyInfo = this.keys.get(this.currentKeyId);
        if (!keyInfo || keyInfo.status !== 'active') {
            throw new Error('Current key is not available for encryption');
        }
      
        // Generate random IV for each encryption
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', keyInfo.key, iv);
      
        let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
        ciphertext += cipher.final('hex');
      
        const authTag = cipher.getAuthTag();
      
        // Increment usage counter
        keyInfo.usage.encryptions++;
      
        return {
            keyId: keyInfo.id,
            algorithm: keyInfo.algorithm,
            ciphertext: ciphertext,
            authTag: authTag.toString('hex'),
            iv: iv.toString('hex'),
            timestamp: Date.now()
        };
    }
  
    async decrypt(encryptedData) {
        const { keyId, ciphertext, authTag, iv } = encryptedData;
      
        const keyInfo = this.keys.get(keyId);
        if (!keyInfo) {
            throw new Error(`Key ${keyId} not found`);
        }
      
        if (keyInfo.status === 'revoked') {
            throw new Error(`Key ${keyId} has been revoked`);
        }
      
        const decipher = crypto.createDecipheriv(
            keyInfo.algorithm,
            keyInfo.key,
            Buffer.from(iv, 'hex')
        );
      
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
        let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
        plaintext += decipher.final('utf8');
      
        // Increment usage counter
        keyInfo.usage.decryptions++;
      
        return plaintext;
    }
  
    revokeKey(keyId) {
        const keyInfo = this.keys.get(keyId);
        if (!keyInfo) {
            throw new Error(`Key ${keyId} not found`);
        }
      
        keyInfo.status = 'revoked';
        this.emit('keyRevoked', keyId);
      
        // If revoking current key, rotate immediately
        if (keyId === this.currentKeyId) {
            this.rotateKey();
        }
    }
  
    getKeyStatus() {
        const status = {
            currentKeyId: this.currentKeyId,
            totalKeys: this.keys.size,
            keysByStatus: {
                active: 0,
                'decrypt-only': 0,
                revoked: 0
            },
            oldestKey: null,
            newestKey: null
        };
      
        let oldestTime = Infinity;
        let newestTime = 0;
      
        for (const [keyId, keyInfo] of this.keys.entries()) {
            status.keysByStatus[keyInfo.status]++;
          
            if (keyInfo.createdAt < oldestTime) {
                oldestTime = keyInfo.createdAt;
                status.oldestKey = {
                    id: keyId,
                    createdAt: new Date(keyInfo.createdAt),
                    age: Date.now() - keyInfo.createdAt
                };
            }
          
            if (keyInfo.createdAt > newestTime) {
                newestTime = keyInfo.createdAt;
                status.newestKey = {
                    id: keyId,
                    createdAt: new Date(keyInfo.createdAt),
                    age: Date.now() - keyInfo.createdAt
                };
            }
        }
      
        return status;
    }
}

// Usage example
async function demonstrateKeyManagement() {
    const keyManager = new ComprehensiveKeyManager({
        rotationInterval: 60 * 1000, // 1 minute for demo
        maxKeyAge: 5 * 60 * 1000     // 5 minutes for demo
    });
  
    // Listen to events
    keyManager.on('keyRotated', (keyId) => {
        console.log(`🔄 Key rotated: ${keyId}`);
    });
  
    keyManager.on('keyRevoked', (keyId) => {
        console.log(`❌ Key revoked: ${keyId}`);
    });
  
    // Wait for initialization
    await new Promise(resolve => {
        keyManager.on('initialized', resolve);
    });
  
    // Encrypt some data
    const message = 'This is a secret message';
    const encrypted = await keyManager.encrypt(message);
    console.log('📦 Encrypted:', encrypted);
  
    // Decrypt the data
    const decrypted = await keyManager.decrypt(encrypted);
    console.log('📖 Decrypted:', decrypted);
  
    // Get key status
    console.log('📊 Key Status:', keyManager.getKeyStatus());
}

// Run the demonstration
demonstrateKeyManagement().catch(console.error);
```

## Advanced Key Management Patterns

### Pattern 1: Multi-Tenant Key Management

```javascript
class MultiTenantKeyManager {
    constructor() {
        this.tenantKeys = new Map();
    }
  
    // Create a dedicated key manager for each tenant
    async createTenant(tenantId) {
        if (this.tenantKeys.has(tenantId)) {
            throw new Error(`Tenant ${tenantId} already exists`);
        }
      
        const tenantKeyManager = new ComprehensiveKeyManager({
            rotationInterval: 24 * 60 * 60 * 1000 // Daily rotation
        });
      
        this.tenantKeys.set(tenantId, tenantKeyManager);
      
        // Wait for initialization
        await new Promise(resolve => {
            tenantKeyManager.on('initialized', resolve);
        });
      
        return tenantKeyManager;
    }
  
    // Get key manager for specific tenant
    getTenantKeyManager(tenantId) {
        const keyManager = this.tenantKeys.get(tenantId);
        if (!keyManager) {
            throw new Error(`Tenant ${tenantId} not found`);
        }
        return keyManager;
    }
  
    // Encrypt data for specific tenant
    async encryptForTenant(tenantId, data) {
        const keyManager = this.getTenantKeyManager(tenantId);
        return await keyManager.encrypt(data);
    }
  
    // Decrypt data for specific tenant
    async decryptForTenant(tenantId, encryptedData) {
        const keyManager = this.getTenantKeyManager(tenantId);
        return await keyManager.decrypt(encryptedData);
    }
}
```

### Pattern 2: Key Versioning and Migration

```javascript
class VersionedKeyManager {
    constructor() {
        this.keys = new Map();
        this.version = '1.0';
    }
  
    // Generate key with version information
    generateKey(keyId) {
        const key = crypto.randomBytes(32);
        const keyInfo = {
            keyId: keyId,
            key: key,
            version: this.version,
            algorithm: 'aes-256-gcm',
            createdAt: Date.now(),
            metadata: {
                compliance: ['FIPS-140-2', 'GDPR'],
                purpose: 'data-encryption'
            }
        };
      
        this.keys.set(keyId, keyInfo);
        return keyInfo;
    }
  
    // Encrypt with metadata
    encrypt(keyId, plaintext) {
        const keyInfo = this.keys.get(keyId);
        if (!keyInfo) {
            throw new Error(`Key ${keyId} not found`);
        }
      
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', keyInfo.key, iv);
      
        let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
        ciphertext += cipher.final('hex');
      
        return {
            version: keyInfo.version,
            keyId: keyId,
            algorithm: keyInfo.algorithm,
            ciphertext: ciphertext,
            authTag: cipher.getAuthTag().toString('hex'),
            iv: iv.toString('hex'),
            encryptedAt: Date.now(),
            metadata: keyInfo.metadata
        };
    }
  
    // Decrypt with version awareness
    decrypt(encryptedData) {
        const { version, keyId, ciphertext, authTag, iv } = encryptedData;
      
        // Version-specific handling
        if (version !== this.version) {
            return this.migrateAndDecrypt(encryptedData);
        }
      
        const keyInfo = this.keys.get(keyId);
        if (!keyInfo) {
            throw new Error(`Key ${keyId} not found`);
        }
      
        const decipher = crypto.createDecipheriv(
            keyInfo.algorithm,
            keyInfo.key,
            Buffer.from(iv, 'hex')
        );
      
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
        let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
        plaintext += decipher.final('utf8');
      
        return plaintext;
    }
  
    // Handle version migrations
    migrateAndDecrypt(encryptedData) {
        const { version } = encryptedData;
      
        console.log(`Migrating from version ${version} to ${this.version}`);
      
        // Implement version-specific migration logic here
        // This is a placeholder for actual migration logic
      
        return this.decrypt(encryptedData);
    }
}
```

## Security Best Practices Summary

> **Remember These Key Principles** :
>
> 1. **Never hardcode keys** in source code or configuration files
> 2. **Use strong key generation** with cryptographically secure random number generators
> 3. **Implement key rotation** with both automatic and manual mechanisms
> 4. **Separate concerns** between encryption keys, authentication keys, and signing keys
> 5. **Log key operations** but never log the keys themselves
> 6. **Use hardware security modules** (HSMs) for production systems
> 7. **Implement proper key lifecycle management** from generation to destruction
> 8. **Plan for key compromise** with revocation and emergency procedures
> 9. **Use key derivation functions** when storing password-derived keys
> 10. **Always authenticate encrypted data** using authenticated encryption modes

Key management in Node.js requires careful attention to security fundamentals. Each pattern we've discussed builds upon basic principles of confidentiality, integrity, and availability. As you implement these patterns, always consider the specific security requirements of your application and comply with relevant regulations and standards.

Remember that crypt
