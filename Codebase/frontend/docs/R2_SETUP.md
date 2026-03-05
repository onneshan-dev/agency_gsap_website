# Cloudflare R2 Setup Guide

Cloudflare R2 is used for storing client documents (PDFs, images, Word docs) during registration.

## Step 1: Create Cloudflare R2 Bucket

1. Go to https://dash.cloudflare.com and sign in
2. Navigate to **R2 Object Storage**
3. Click **"Create Bucket"**
4. Name your bucket (e.g., `onneshon-client-documents`)
5. Choose a location (optional - leave as default for automatic)
6. Click **Create Bucket**

## Step 2: Get R2 Credentials

1. In your R2 bucket, go to **Settings**
2. Under **R2 API Tokens**, click **"Manage API Tokens"**
3. Click **"Create API Token"**
4. Configure the token:
   - **Token name**: `Client Upload Token`
   - **Permissions**: Object Read & Write
   - **Bucket**: Select your bucket
5. Click **Create API Token**
6. **Copy and save**:
   - Access Key ID
   - Secret Access Key
   - Endpoint URL (will look like: `https://<account-id>.r2.cloudflarestorage.com`)

## Step 3: Configure Public Access

### Option A: Custom Domain (Recommended for production)
1. Go to your bucket settings
2. Under **Public Custom Domains**, click **Connect Domain**
3. Enter your domain (e.g., `cdn.onneshon.dev`)
4. Follow Cloudflare's instructions to verify the domain
5. Use this domain as `VITE_R2_PUBLIC_URL`

### Option B: Public Access with r2.dev
1. In your bucket settings, enable **Public Access**
2. Your public URL will be: `https://pub-<account-id>.r2.dev`
3. Use this as `VITE_R2_PUBLIC_URL`

## Step 4: Update Environment Variables

Add to your `.env` file:

```env
# Cloudflare R2 Configuration
VITE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
VITE_R2_ACCESS_KEY_ID=your-access-key-id
VITE_R2_SECRET_ACCESS_KEY=your-secret-access-key
VITE_R2_BUCKET_NAME=onneshon-client-documents
VITE_R2_PUBLIC_URL=https://pub-your-account-id.r2.dev
```

Replace:
- `your-account-id` with your Cloudflare account ID
- `your-access-key-id` with your token's Access Key ID
- `your-secret-access-key` with your token's Secret Access Key
- `VITE_R2_PUBLIC_URL` with your public domain or r2.dev URL

## Step 5: Test File Upload

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to `/register`

3. Fill in the registration form

4. Try uploading files:
   - PDF documents
   - Images (PNG, JPG, GIF)
   - Word documents (DOC, DOCX)
   - Text files (TXT)

5. Submit the form

6. Verify files are uploaded:
   - Check Cloudflare R2 bucket for new files
   - Verify file URLs are stored in Supabase profiles table

## File Upload Limits

- **Max file size**: 10MB per file
- **Max files**: 5 files per registration
- **Allowed types**:
  - PDF (`application/pdf`)
  - Images (`image/*`)
  - Word Docs (`application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
  - Text files (`text/plain`)

## Security Considerations

1. **CORS Configuration**: Set up CORS in R2 settings:
   ```json
   {
     "AllowedOrigins": ["http://localhost:5173", "https://yourdomain.com"],
     "AllowedMethods": ["PUT", "GET"],
     "AllowedHeaders": ["*"],
     "MaxAgeSeconds": 3000
   }
   ```

2. **File Naming**: Files are stored with timestamp prefix to avoid collisions:
   ```
   client-documents/{user-id}/{timestamp}-{sanitized-filename}
   ```

3. **Access Control**: Files are publicly accessible via the public URL. For private files, implement signed URLs.

## Troubleshooting

### Upload Fails
- Check R2 credentials in `.env`
- Verify bucket name is correct
- Check file size limits
- Check browser console for errors

### Files Not Accessible
- Verify `VITE_R2_PUBLIC_URL` is correct
- Check if bucket public access is enabled
- Test the public URL directly in browser

### CORS Errors
- Update CORS configuration in R2 settings
- Ensure your domain is in AllowedOrigins

## Pricing

Cloudflare R2 pricing (as of 2024):
- **Storage**: $0.015 per GB-month
- **Class A Operations** (uploads): $4.50 per million requests
- **Class B Operations** (downloads): $0.36 per million requests
- **No egress fees** for downloading!

For typical client registration use, costs will be minimal.

## Alternative Storage Options

If you prefer not to use Cloudflare R2:

1. **Supabase Storage**: Built-in storage with RLS support
2. **AWS S3**: More features, higher cost
3. **DigitalOcean Spaces**: S3-compatible, simpler pricing

To switch, update `src/lib/r2/client.ts` and `src/lib/r2/upload.ts` with the new provider's SDK.