<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\{
  AppleMusicDownloaderController,
};

Route::prefix('downloader')->group(function () {
  Route::prefix('apple-music')->group(function () {
    Route::post('generate', [AppleMusicDownloaderController::class, 'generate']); // ?url=
    Route::get('get-files/{folder}', [AppleMusicDownloaderController::class, 'getFiles']);
    Route::get('download-zip', [AppleMusicDownloaderController::class, 'downloadZip']); // ?zip=
  });
});