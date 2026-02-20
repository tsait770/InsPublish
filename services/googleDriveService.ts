
export const googleDriveService = {
  CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // Placeholder for actual Client ID
  SCOPES: 'https://www.googleapis.com/auth/drive.file',

  async authenticate(): Promise<string> {
    return new Promise((resolve, reject) => {
      const callbackUrl = window.location.origin;
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${this.CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=token&scope=${encodeURIComponent(this.SCOPES)}&include_granted_scopes=true&state=inspublish_auth`;
      
      const width = 500, height = 600;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      const popup = window.open(authUrl, 'google-auth', `width=${width},height=${height},left=${left},top=${top}`);

      const checkPopup = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(checkPopup);
          reject(new Error('認證視窗已關閉'));
        }

        try {
          if (popup && popup.location.hash) {
            const hash = popup.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            const token = params.get('access_token');
            if (token) {
              clearInterval(checkPopup);
              popup.close();
              resolve(token);
            }
          }
        } catch (e) {
          // Ignore cross-origin errors while popup is on Google's domain
        }
      }, 500);
    });
  },

  async uploadFile(blob: Blob, fileName: string, accessToken: string): Promise<any> {
    const metadata = {
      name: fileName,
      mimeType: blob.type,
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: form,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || '上傳至 Google Drive 失敗');
    }

    return await response.json();
  }
};
