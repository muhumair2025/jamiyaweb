<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            // One SectionInstance JSON each — single global header + footer
            // shared across every page. Nullable: a site without header
            // simply renders pages without one (matches the current
            // behaviour for back-compat).
            $table->json('header_json')->nullable()->after('tokens_json');
            $table->json('footer_json')->nullable()->after('header_json');
        });
    }

    public function down(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            $table->dropColumn(['header_json', 'footer_json']);
        });
    }
};
