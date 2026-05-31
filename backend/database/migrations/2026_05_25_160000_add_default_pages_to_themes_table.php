<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('themes', function (Blueprint $table) {
            // When a theme ships full multi-page content (Home + About +
            // Programs + …), it lives here as a slug → page payload map.
            // WebsiteCreator materialises every entry as a real `pages` row
            // when a user picks this theme. Null = fall back to seeding
            // only the homepage from the theme's section bindings.
            $table->json('default_pages_json')->nullable()->after('tokens_json');

            // Same shape as websites.header_json / footer_json — the theme
            // ships a default global header + footer so the user has them
            // configured out of the box.
            $table->json('default_header_json')->nullable()->after('default_pages_json');
            $table->json('default_footer_json')->nullable()->after('default_header_json');
        });
    }

    public function down(): void
    {
        Schema::table('themes', function (Blueprint $table) {
            $table->dropColumn([
                'default_pages_json',
                'default_header_json',
                'default_footer_json',
            ]);
        });
    }
};
