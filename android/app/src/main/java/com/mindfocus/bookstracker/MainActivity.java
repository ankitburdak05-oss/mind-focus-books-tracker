package com.mindfocus.bookstracker;

import android.annotation.SuppressLint;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends AppCompatActivity {
    private static final String CHANNEL_ID = "mind_focus_reading_reminders";
    private static final int NOTIF_REQ_CODE = 102;
    private WebView webView;
    private ValueCallback<Uri[]> uploadMessage;
    private final static int FILE_CHOOSER_RESULT_CODE = 1001;

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Completely Full-screen: NO title bar, NO URL bar, NO browser tabs, NO X close button!
        supportRequestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);

        hideSystemUI();

        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        // Add native JavaScript bridge for Downloads and Cloud Sharing
        WebAppInterface webAppInterface = new WebAppInterface();
        webView.addJavascriptInterface(webAppInterface, "Android");

        // Handle file and APK downloads from WebView
        webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
            if (url != null && (url.endsWith(".apk") || url.contains("/releases/download/"))) {
                webAppInterface.downloadAndInstallApk(url);
            } else if (url != null) {
                try {
                    Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(browserIntent);
                } catch (Exception ignored) {}
            }
        });

        // Keep all navigation inside the webview - PURE NATIVE STANDALONE APP
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url != null && (url.endsWith(".apk") || url.contains("/releases/download/"))) {
                    webAppInterface.downloadAndInstallApk(url);
                    return true;
                }
                if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
                    try {
                        Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(browserIntent);
                        return true;
                    } catch (Exception ignored) {}
                }
                view.loadUrl(url);
                return true;
            }
        });

        // Request camera permission at startup
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.CAMERA}, 101);
        }



        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    request.grant(request.getResources());
                });
            }

            // CRITICAL: Handle <input type="file"> to open Phone Gallery / Camera / Files
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (uploadMessage != null) {
                    uploadMessage.onReceiveValue(null);
                    uploadMessage = null;
                }
                uploadMessage = filePathCallback;

                Intent intent = null;
                try {
                    if (fileChooserParams != null) {
                        intent = fileChooserParams.createIntent();
                    }
                } catch (Exception ignored) {}

                if (intent == null) {
                    intent = new Intent(Intent.ACTION_GET_CONTENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType("*/*");
                }

                try {
                    startActivityForResult(Intent.createChooser(intent, "Choose File or Gallery"), FILE_CHOOSER_RESULT_CODE);
                } catch (Exception e) {
                    if (uploadMessage != null) {
                        uploadMessage.onReceiveValue(null);
                        uploadMessage = null;
                    }
                    return false;
                }
                return true;
            }
        });

        // Load 100% offline local HTML assets packaged directly inside the APK with shortcut intent action
        String initialUrl = "file:///android_asset/index.html";
        String action = getIntent() != null ? getIntent().getStringExtra("action") : null;
        if (action != null && !action.isEmpty()) {
            initialUrl += "?action=" + action;
        }
        webView.loadUrl(initialUrl);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String action = intent != null ? intent.getStringExtra("action") : null;
        if (action != null && !action.isEmpty() && webView != null) {
            webView.loadUrl("file:///android_asset/index.html?action=" + action);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_RESULT_CODE) {
            if (uploadMessage == null) return;
            Uri[] results = null;
            if (resultCode == RESULT_OK && data != null) {
                String dataString = data.getDataString();
                if (dataString != null) {
                    results = new Uri[]{Uri.parse(dataString)};
                } else if (data.getClipData() != null) {
                    int count = data.getClipData().getItemCount();
                    results = new Uri[count];
                    for (int i = 0; i < count; i++) {
                        results[i] = data.getClipData().getItemAt(i).getUri();
                    }
                }
            }
            uploadMessage.onReceiveValue(results);
            uploadMessage = null;
        }
    }

    public class WebAppInterface {
        @JavascriptInterface
        public String fetchRemoteText(String urlString) {
            if (urlString == null || urlString.trim().isEmpty()) return null;
            try {
                java.net.URL url = new java.net.URL(urlString);
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android " + Build.VERSION.RELEASE + "; " + Build.MODEL + ") MindFocusBooksTracker");
                conn.setRequestProperty("Accept", "*/*");
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(15000);
                conn.setInstanceFollowRedirects(true);
                int code = conn.getResponseCode();
                if (code >= 200 && code < 400) {
                    try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                        StringBuilder sb = new StringBuilder();
                        String line;
                        while ((line = reader.readLine()) != null) {
                            sb.append(line).append("\n");
                        }
                        return sb.toString().trim();
                    }
                }
            } catch (Exception ignored) {}
            return null;
        }

        @JavascriptInterface
        public String getInstalledAppVersion() {
            try {
                android.content.pm.PackageInfo pInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
                return (pInfo != null && pInfo.versionName != null && !pInfo.versionName.isEmpty()) 
                        ? pInfo.versionName 
                        : "0.0.55";
            } catch (Exception e) {
                return "0.0.55";
            }
        }

        @JavascriptInterface
        public void saveBackupFile(String jsonContent, String fileName) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
                    values.put(MediaStore.MediaColumns.MIME_TYPE, "application/json");
                    values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);

                    Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    if (uri != null) {
                        try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                            if (out != null) {
                                out.write(jsonContent.getBytes(StandardCharsets.UTF_8));
                            }
                        }
                    }
                } else {
                    File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                    if (!downloadsDir.exists()) downloadsDir.mkdirs();
                    File file = new File(downloadsDir, fileName);
                    try (FileOutputStream fos = new FileOutputStream(file)) {
                        fos.write(jsonContent.getBytes(StandardCharsets.UTF_8));
                    }
                }

                runOnUiThread(() -> {
                    Toast.makeText(MainActivity.this, "✅ Backup saved to phone Downloads: " + fileName, Toast.LENGTH_LONG).show();
                });
            } catch (Exception e) {
                runOnUiThread(() -> {
                    Toast.makeText(MainActivity.this, "Save error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                });
            }
        }

        @JavascriptInterface
        public void shareBackup(String jsonContent, String fileName) {
            shareFileViaIntent(jsonContent, fileName, "application/json", null, null);
        }

        @JavascriptInterface
        public void shareToWhatsApp(String content, String fileName, String mimeType, String caption) {
            shareFileViaIntent(content, fileName, mimeType, caption, "com.whatsapp");
        }

        @JavascriptInterface
        public void shareTextToWhatsApp(String messageText) {
            try {
                Intent intent = new Intent(Intent.ACTION_SEND);
                intent.setType("text/plain");
                intent.putExtra(Intent.EXTRA_TEXT, messageText);

                boolean launched = false;
                String[] waPackages = new String[]{"com.whatsapp", "com.whatsapp.w4b"};
                for (String pkg : waPackages) {
                    try {
                        getPackageManager().getPackageInfo(pkg, 0);
                        Intent waIntent = new Intent(intent);
                        waIntent.setPackage(pkg);
                        startActivity(waIntent);
                        launched = true;
                        break;
                    } catch (android.content.pm.PackageManager.NameNotFoundException ignored) {}
                }

                if (!launched) {
                    startActivity(Intent.createChooser(intent, "Share via WhatsApp"));
                }
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "WhatsApp error: " + e.getMessage(), Toast.LENGTH_SHORT).show());
            }
        }

        private void shareFileViaIntent(String content, String fileName, String mimeType, String caption, String preferredPackage) {
            try {
                if (fileName == null || fileName.trim().isEmpty()) {
                    fileName = "MindFocus_Backup.json";
                }

                File shareDir = new File(getCacheDir(), "shared_export");
                if (!shareDir.exists()) shareDir.mkdirs();
                File targetFile = new File(shareDir, fileName);
                try (FileOutputStream fos = new FileOutputStream(targetFile)) {
                    fos.write(content.getBytes(StandardCharsets.UTF_8));
                }

                Uri contentUri = androidx.core.content.FileProvider.getUriForFile(
                        MainActivity.this,
                        getPackageName() + ".fileprovider",
                        targetFile
                );

                Intent intent = new Intent(Intent.ACTION_SEND);
                String type = (mimeType != null && !mimeType.trim().isEmpty()) ? mimeType : "application/json";
                intent.setType(type);
                intent.putExtra(Intent.EXTRA_STREAM, contentUri);
                intent.putExtra(Intent.EXTRA_SUBJECT, fileName);
                if (caption != null && !caption.trim().isEmpty()) {
                    intent.putExtra(Intent.EXTRA_TEXT, caption);
                }
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

                boolean launched = false;
                if ("com.whatsapp".equals(preferredPackage)) {
                    String[] waPackages = new String[]{"com.whatsapp", "com.whatsapp.w4b"};
                    for (String pkg : waPackages) {
                        try {
                            getPackageManager().getPackageInfo(pkg, 0);
                            Intent waIntent = new Intent(intent);
                            waIntent.setPackage(pkg);
                            startActivity(waIntent);
                            launched = true;
                            break;
                        } catch (android.content.pm.PackageManager.NameNotFoundException ignored) {}
                    }
                }

                if (!launched) {
                    startActivity(Intent.createChooser(intent, "Share Backup to WhatsApp / Drive / Files"));
                }
            } catch (Exception e) {
                runOnUiThread(() -> {
                    Toast.makeText(MainActivity.this, "Share error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                });
            }
        }

        @JavascriptInterface
        public void downloadAndInstallApk(String apkUrl) {
            new Thread(() -> {
                try {
                    runOnUiThread(() -> Toast.makeText(MainActivity.this, "Downloading update package... ⏳", Toast.LENGTH_SHORT).show());
                    
                    String targetUrl = apkUrl;
                    java.net.HttpURLConnection connection = null;
                    int redirects = 0;
                    
                    while (redirects < 8) {
                        java.net.URL url = new java.net.URL(targetUrl);
                        connection = (java.net.HttpURLConnection) url.openConnection();
                        connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android " + Build.VERSION.RELEASE + "; " + Build.MODEL + ") MindFocusBooksTracker");
                        connection.setRequestProperty("Accept", "*/*");
                        connection.setInstanceFollowRedirects(true);
                        connection.setConnectTimeout(25000);
                        connection.setReadTimeout(60000);
                        connection.connect();
                        
                        int status = connection.getResponseCode();
                        if (status == java.net.HttpURLConnection.HTTP_MOVED_TEMP 
                                || status == java.net.HttpURLConnection.HTTP_MOVED_PERM 
                                || status == java.net.HttpURLConnection.HTTP_SEE_OTHER 
                                || status == 307 
                                || status == 308) {
                            String redirectUrl = connection.getHeaderField("Location");
                            if (redirectUrl != null && !redirectUrl.isEmpty()) {
                                if (!redirectUrl.startsWith("http://") && !redirectUrl.startsWith("https://")) {
                                    redirectUrl = new java.net.URL(url, redirectUrl).toString();
                                }
                                targetUrl = redirectUrl;
                                connection.disconnect();
                                redirects++;
                                continue;
                            }
                        }
                        break;
                    }

                    int finalStatus = connection.getResponseCode();
                    if (finalStatus != java.net.HttpURLConnection.HTTP_OK) {
                        throw new Exception("Server returned HTTP " + finalStatus);
                    }

                    File updatesDir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                    if (updatesDir == null) updatesDir = new File(getCacheDir(), "updates");
                    if (!updatesDir.exists()) updatesDir.mkdirs();
                    File apkFile = new File(updatesDir, "MindFocusBooks-Update.apk");
                    if (apkFile.exists()) apkFile.delete();

                    try (java.io.InputStream in = connection.getInputStream();
                         FileOutputStream out = new FileOutputStream(apkFile)) {
                        byte[] buffer = new byte[8192];
                        int bytesRead;
                        while ((bytesRead = in.read(buffer)) != -1) {
                            out.write(buffer, 0, bytesRead);
                        }
                        out.flush();
                    }

                    if (!apkFile.exists() || apkFile.length() < 100000) {
                        throw new Exception("Downloaded file is empty or corrupted (" + (apkFile.exists() ? apkFile.length() : 0) + " bytes)");
                    }
                    apkFile.setReadable(true, false);

                    runOnUiThread(() -> {
                        try {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                if (!getPackageManager().canRequestPackageInstalls()) {
                                    Toast.makeText(MainActivity.this, "⚠️ Kripya 'Allow from this source' enable karein taki update install ho sake", Toast.LENGTH_LONG).show();
                                    Intent permissionIntent = new Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                                    permissionIntent.setData(Uri.parse("package:" + getPackageName()));
                                    permissionIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                    startActivity(permissionIntent);
                                    return;
                                }
                            }

                            Uri apkUri = androidx.core.content.FileProvider.getUriForFile(
                                    MainActivity.this,
                                    getPackageName() + ".fileprovider",
                                    apkFile
                            );
                            Intent installIntent = new Intent(Intent.ACTION_VIEW);
                            installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                            installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                            installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(installIntent);
                            Toast.makeText(MainActivity.this, "⚡ Launching Package Installer...", Toast.LENGTH_SHORT).show();
                        } catch (Exception e) {
                            Toast.makeText(MainActivity.this, "Installation error: " + e.getMessage() + ". Opening in browser...", Toast.LENGTH_LONG).show();
                            try {
                                Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl));
                                browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                startActivity(browserIntent);
                            } catch (Exception ignored) {}
                        }
                    });
                } catch (Exception e) {
                    runOnUiThread(() -> {
                        Toast.makeText(MainActivity.this, "Download error: " + e.getMessage() + ". Opening in browser...", Toast.LENGTH_LONG).show();
                        try {
                            Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl));
                            browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(browserIntent);
                        } catch (Exception ignored) {}
                    });
                }
            }).start();
        }

        @JavascriptInterface
        public void requestNotificationPermission() {
            runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    if (ContextCompat.checkSelfPermission(MainActivity.this, android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                        ActivityCompat.requestPermissions(MainActivity.this, new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, NOTIF_REQ_CODE);
                    } else {
                        Toast.makeText(MainActivity.this, "Device notifications are active! 🔔", Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Toast.makeText(MainActivity.this, "Notifications are active on this device! 🔔", Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public boolean isNotificationPermissionGranted() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                return ContextCompat.checkSelfPermission(MainActivity.this, android.Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
            }
            return true;
        }

        @JavascriptInterface
        public void postNativeNotification(String title, String message, String bookTitle, String imageAssetOrUrl) {
            new Thread(() -> {
                try {
                    Intent intent = new Intent(MainActivity.this, MainActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                    intent.putExtra("from_notification", true);
                    if (bookTitle != null) intent.putExtra("book_title", bookTitle);

                    int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        flags |= PendingIntent.FLAG_IMMUTABLE;
                    }
                    PendingIntent pendingIntent = PendingIntent.getActivity(MainActivity.this, (int) System.currentTimeMillis(), intent, flags);

                    NotificationCompat.Builder builder = new NotificationCompat.Builder(MainActivity.this, CHANNEL_ID)
                            .setSmallIcon(R.mipmap.ic_launcher)
                            .setContentTitle(title != null && !title.isEmpty() ? title : "Mind Focus Books 📖")
                            .setContentText(message != null && !message.isEmpty() ? message : "Time for your reading session!")
                            .setSubText(bookTitle != null && !bookTitle.isEmpty() ? bookTitle : "Mind Focus Tracker")
                            .setPriority(NotificationCompat.PRIORITY_HIGH)
                            .setCategory(NotificationCompat.CATEGORY_REMINDER)
                            .setAutoCancel(true)
                            .setContentIntent(pendingIntent)
                            .setVibrate(new long[]{0, 350, 150, 350});

                    Bitmap bigBitmap = null;
                    if (imageAssetOrUrl != null && !imageAssetOrUrl.trim().isEmpty()) {
                        try {
                            String trimmed = imageAssetOrUrl.trim();
                            if (trimmed.startsWith("data:image")) {
                                int commaIndex = trimmed.indexOf(",");
                                if (commaIndex != -1) {
                                    String base64Data = trimmed.substring(commaIndex + 1);
                                    byte[] decodedBytes = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT);
                                    bigBitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);
                                }
                            } else if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
                                java.net.URL url = new java.net.URL(trimmed);
                                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                                conn.setConnectTimeout(8000);
                                conn.setReadTimeout(12000);
                                conn.connect();
                                if (conn.getResponseCode() == 200) {
                                    bigBitmap = BitmapFactory.decodeStream(conn.getInputStream());
                                }
                            } else {
                                String assetPath = trimmed.startsWith("file:///android_asset/") 
                                        ? trimmed.replace("file:///android_asset/", "") 
                                        : trimmed;
                                try (java.io.InputStream is = getAssets().open(assetPath)) {
                                    bigBitmap = BitmapFactory.decodeStream(is);
                                }
                            }
                        } catch (Exception ignored) {}
                    }

                    if (bigBitmap != null) {
                        builder.setLargeIcon(bigBitmap);
                        builder.setStyle(new NotificationCompat.BigPictureStyle()
                                .bigPicture(bigBitmap)
                                .setBigContentTitle(title)
                                .setSummaryText(message));
                    } else {
                        builder.setStyle(new NotificationCompat.BigTextStyle()
                                .setBigContentTitle(title)
                                .bigText(message + (bookTitle != null && !bookTitle.isEmpty() ? "\n\n📖 Book: " + bookTitle : "")));
                    }

                    NotificationManagerCompat notificationManager = NotificationManagerCompat.from(MainActivity.this);
                    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU || 
                            ContextCompat.checkSelfPermission(MainActivity.this, android.Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
                        notificationManager.notify((int) (System.currentTimeMillis() % 100000), builder.build());
                    } else {
                        requestNotificationPermission();
                    }
                } catch (Exception e) {
                    runOnUiThread(() -> Toast.makeText(MainActivity.this, "Notification error: " + e.getMessage(), Toast.LENGTH_SHORT).show());
                }
            }).start();
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Mind Focus Reading Reminders";
            String description = "Daily reading reminders, book notes and motivation alerts";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0, 300, 200, 300});
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    private void hideSystemUI() {
        View decorView = getWindow().getDecorView();
        decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
        );
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemUI();
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null) {
            // First check if app's JavaScript router has an active detail or modal view to close
            webView.evaluateJavascript(
                "(function() { if (typeof window.handleAppBackButton === 'function') { return window.handleAppBackButton(); } return false; })()",
                result -> {
                    if ("true".equals(result)) {
                        // JavaScript handled closing the view/detail screen!
                        return;
                    }
                    // Fallback to webview history or system back
                    if (webView.canGoBack()) {
                        webView.goBack();
                    } else {
                        super.onBackPressed();
                    }
                }
            );
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) {
            webView.onPause();
            webView.pauseTimers();
        }
    }

    @Override
    protected void onStop() {
        super.onStop();
        if (webView != null) {
            webView.onPause();
            webView.pauseTimers();
            webView.stopLoading();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
            webView.resumeTimers();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }

    private void checkNativeUpdatesInBackground() {
        new Thread(() -> {
            try {
                Thread.sleep(2500);
                String[] configUrls = new String[]{
                    "https://ankitburdak05-oss.github.io/mind-focus-books-tracker/remote-config.json?t=" + System.currentTimeMillis(),
                    "https://cdn.jsdelivr.net/gh/ankitburdak05-oss/mind-focus-books-tracker@main/remote-config.json?t=" + System.currentTimeMillis(),
                    "https://raw.githubusercontent.com/ankitburdak05-oss/mind-focus-books-tracker/main/remote-config.json?t=" + System.currentTimeMillis()
                };

                for (String urlStr : configUrls) {
                    String jsonText = fetchRemoteUrlDirect(urlStr);
                    if (jsonText != null && jsonText.contains("activeRelease")) {
                        org.json.JSONObject obj = new org.json.JSONObject(jsonText);
                        org.json.JSONObject active = obj.optJSONObject("activeRelease");
                        if (active != null) {
                            String remoteVer = active.optString("version", "");
                            String currentVer = getInstalledAppVersionDirect();
                            if (isNewerVersionJava(remoteVer, currentVer)) {
                                runOnUiThread(() -> {
                                    Toast.makeText(MainActivity.this, "🚀 System Update " + remoteVer + " Ready!", Toast.LENGTH_LONG).show();
                                    if (webView != null) {
                                        webView.evaluateJavascript(
                                            "if (typeof triggerUpdateFromNative === 'function') { " +
                                            "  triggerUpdateFromNative(" + active.toString() + "); " +
                                            "}",
                                            null
                                        );
                                    }
                                });
                                break;
                            }
                        }
                    }
                }
            } catch (Exception ignored) {}
        }).start();
    }

    private String getInstalledAppVersionDirect() {
        try {
            android.content.pm.PackageInfo pInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
            return (pInfo != null && pInfo.versionName != null && !pInfo.versionName.isEmpty()) 
                    ? pInfo.versionName 
                    : "0.0.55";
        } catch (Exception e) {
            return "0.0.55";
        }
    }

    private boolean isNewerVersionJava(String remote, String current) {
        if (remote == null || current == null) return false;
        String rClean = remote.trim().replaceFirst("^[vV]", "");
        String cClean = current.trim().replaceFirst("^[vV]", "");
        if (rClean.equals(cClean)) return false;
        String[] rParts = rClean.split("\\.");
        String[] cParts = cClean.split("\\.");
        int len = Math.max(rParts.length, cParts.length);
        for (int i = 0; i < len; i++) {
            int rv = i < rParts.length ? Integer.parseInt(rParts[i].replaceAll("\\D+", "0")) : 0;
            int cv = i < cParts.length ? Integer.parseInt(cParts[i].replaceAll("\\D+", "0")) : 0;
            if (rv > cv) return true;
            if (rv < cv) return false;
        }
        return false;
    }

    private String fetchRemoteUrlDirect(String urlString) {
        try {
            java.net.URL url = new java.net.URL(urlString);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android " + Build.VERSION.RELEASE + ") MindFocusBooksTracker");
            conn.setRequestProperty("Accept", "*/*");
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(12000);
            conn.setInstanceFollowRedirects(true);
            int code = conn.getResponseCode();
            if (code >= 200 && code < 400) {
                try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        sb.append(line).append("\n");
                    }
                    return sb.toString().trim();
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

}
