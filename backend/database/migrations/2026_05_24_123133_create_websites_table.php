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
        Schema::create('websites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('theme_id')->constrained()->restrictOnDelete();

            // Routing
            $table->string('subdomain', 64)->unique();           // mosque, jamia-arabia, …
            $table->string('custom_domain')->nullable()->unique(); // jamia-arabia.org

            // Identity
            $table->string('site_name');
            $table->string('tagline')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('favicon_path')->nullable();

            // Theming
            $table->json('tokens_json')->nullable();             // overrides over theme defaults
            $table->json('site_languages');                      // ["en","ar"]
            $table->string('default_locale', 8)->default('en');

            // Lifecycle
            $table->string('status', 16)->default('draft');      // draft | published
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'published_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('websites');
    }
};
