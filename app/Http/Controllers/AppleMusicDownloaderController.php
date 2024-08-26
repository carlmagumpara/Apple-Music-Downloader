<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{ Process, Cache, Storage };
use Illuminate\Support\Str;
use GuzzleHttp\Client;
use App\Jobs\DownloaderJob;
use Illuminate\Filesystem\Filesystem;

class AppleMusicDownloaderController extends Controller
{
    public function extractLinks($url)
    {
        $client = new Client();

        $response = $client->request('GET', $url);
        $body = $response->getBody();
        $content = (string) $body;

        preg_match_all('#\bhttps?://[^,\s()<>]+(?:\([\w\d]+\)|([^,[:punct:]\s]|/))#', $content, $matches);

        $albumLinks = [];

        foreach (array_unique($matches[0]) as $link) {
            if (strpos($link, 'https://music.apple.com/ph/song/') !== false) {
                $albumLinks[] = $link;
            }
        }

        return $albumLinks;
    }

    public function generate(Request $request)
    {
        $folder = Cache::get($request->url);

        if (!$folder) {
            $data = [
                'name' => (string) Str::ulid(),
                'links' => $this->extractLinks($request->url),
            ];
            Cache::put($request->url, $data);
            Cache::put($data['name'], $data['links']);
            $folder = $data;
        }

        DownloaderJob::dispatch(
          $request->url, 
          $folder['links'],
          $folder['name']
        );

        return response()->json([
            'result' => 'success', 
            'message' => '',
            'data' => $folder
        ], 200);
    }

    public function downloadZip(Request $request)
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

    public function getFiles($folder)
    {
        $links = Cache::get($folder);

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
                'links' => $links,
                'files' => $viewable,
            ]
        ], 200);
    }

    // https://amdl.carlmagumpara.tech/api/downloader/apple-music/clean-up

    public function cleanUp()
    {
        $result = Process::run('cd '.storage_path('app/public/albums').' && sudo rm -rf *');

        \Log::info($result->successful());
        \Log::info($result->failed());
        \Log::info($result->exitCode());
        \Log::info($result->output());
        \Log::info($result->errorOutput());

        Cache::flush();

        return 'Cleaned!';
    }
}
