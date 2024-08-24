<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use GuzzleHttp\Client;

class AppleMusicDownloaderController extends Controller
{
    public function extract(Request $request)
    {
        // Create a new Guzzle client instance
        $client = new Client();
        
        // Send a GET request to the URL
        $response = $client->request('GET', $request->url);
        $body = $response->getBody();
        $content = (string) $body;

        preg_match_all('#\bhttps?://[^,\s()<>]+(?:\([\w\d]+\)|([^,[:punct:]\s]|/))#', $content, $matches);

        $albumLinks = [];

        foreach (array_unique($matches[0]) as $link) {
          if (strpos($link, 'https://music.apple.com/ph/song/') !== false) {
            $albumLinks[] = $link;
          }
        }

        return response()->json([
            'result' => 'success', 
            'message' => '',
            'data' => [
                'album_links' => $albumLinks,
            ]
        ], 200);
    }

    public function generate(Request $request)
    {
      $folder = $request->key;

      $process = new Process([
          '/usr/local/bin/gamdl', 
          $request->url, 
          '--template-folder-album', 
          'albums/'.$folder.'/{album} - {album_artist}', 
          '--output-path', 
          'storage',
          '--ffmpeg-path',
          '/usr/local/bin/ffmpeg',
          '--temp-path',
          '../../temp'
          // '--download-mode',
          // 'nm3u8dlre'
      ]);

      try {
          $process->setTimeout(99999999);
          $process->run();
          \Log::info($process->getOutput());
          \Log::info($process->getErrorOutput());
      } catch (ProcessFailedException $exception) {
          \Log::info($exception->getMessage());
      }

      $viewable = [];

      $files = Storage::allFiles('public/albums/'.$folder);

      foreach ($files as $file) {
          $fileInfo = pathinfo(basename($file));
          if ($fileInfo['extension'] === 'm4a') {
            $parts = explode('/', $file);

            if ($parts[0] === 'public') {
                $parts[0] = 'storage';
            }

            $viewable[] = url(implode('/', $parts));
          }
      }

      return response()->json([
          'result' => 'success', 
          'message' => '',
          'data' => [
              'files' => $viewable,
          ]
      ], 200);
    }

    public function download(Request $request)
    {
      $folder = $request->zip_name;
      $files = Storage::allFiles('public/albums/'.$folder);

      $zip = new \ZipArchive;
      $zipFileName = explode("/", $files[0])[3].'.zip';

      if ($zip->open(public_path($zipFileName), \ZipArchive::CREATE) === TRUE) {
          foreach ($files as $file) {
              $zip->addFile(storage_path('app/'.$file), basename($file));
              $fileInfo = pathinfo(basename($file));
              if ($fileInfo['extension'] === 'm4a') {
                $parts = explode('/', $file);

                if ($parts[0] === 'public') {
                    $parts[0] = 'storage';
                }

                $viewable[] = url(implode('/', $parts));
              }
          }
          $zip->close();

          return response()->download(public_path($zipFileName))->deleteFileAfterSend(true);
      } else {
          return "Failed to create the zip file.";
      }
    }
}
