<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\{ Process, Cache, Storage };

class DownloaderJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */

    protected $url;
    protected $folder;

    public function __construct(
      $url, 
      $folder
    )
    {
        $this->url = $url;
        $this->folder = $folder;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $result = Process::forever()->run("gamdl ".$this->url." --template-folder-album 'albums/".$this->folder."/{album} - {album_artist}' --output-path ".storage_path('app/public')." --ffmpeg-path /usr/local/bin/ffmpeg --cookies-path ".base_path('cookies.txt'));
  
        \Log::info($result->successful());
        \Log::info($result->failed());
        \Log::info($result->exitCode());
        \Log::info($result->output());
        \Log::info($result->errorOutput());
    }
}
