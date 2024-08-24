<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\{
  AppleMusicDownloaderController,
};

Route::prefix('downloader')->group(function () {
  Route::prefix('apple-music')->group(function () {
    Route::post('extract', [AppleMusicDownloaderController::class, 'extract']); // ?url=
    Route::post('generate', [AppleMusicDownloaderController::class, 'generate']); // ?url=
    Route::get('download', [AppleMusicDownloaderController::class, 'download']); // ?zip=
  });
});