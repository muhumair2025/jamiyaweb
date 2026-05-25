<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->string('kind', 16)->default('image')->after('mime');
            $table->string('original_filename')->nullable()->after('path');
            $table->string('title')->nullable()->after('original_filename');
            $table->string('folder', 64)->nullable()->after('title');
            $table->string('hash', 64)->nullable()->after('size');
            $table->json('variants')->nullable()->after('height');
            $table->json('metadata')->nullable()->after('variants');
            $table->softDeletes();

            $table->index(['user_id', 'kind']);
            $table->index(['website_id', 'folder']);
            $table->index('hash');
        });
    }

    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'kind']);
            $table->dropIndex(['website_id', 'folder']);
            $table->dropIndex(['hash']);

            $table->dropSoftDeletes();
            $table->dropColumn([
                'kind',
                'original_filename',
                'title',
                'folder',
                'hash',
                'variants',
                'metadata',
            ]);
        });
    }
};
