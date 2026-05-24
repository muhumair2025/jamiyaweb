<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('website_id')->constrained()->cascadeOnDelete();
            $table->string('slug', 128);                          // unique per website
            $table->string('title');
            $table->json('content_json');                         // {sections:[{id,type,settings}]}
            $table->json('seo_json')->nullable();                 // {title, description, og_image…}
            $table->boolean('is_homepage')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('status', 16)->default('draft');       // draft | published
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->unique(['website_id', 'slug']);
            $table->index(['website_id', 'is_homepage']);
            $table->index(['website_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
