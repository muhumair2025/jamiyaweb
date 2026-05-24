<?php

namespace Database\Seeders;

use App\Models\Section;
use App\Models\Theme;
use Illuminate\Database\Seeder;

/**
 * Seeds the initial theme engine with one theme + two reusable sections.
 * The actual React implementations live in frontend/src/sections/{slug}.
 *
 * Idempotent — safe to re-run via `php artisan db:seed --class=EngineSeeder`.
 */
class EngineSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Section: hero-basic ──────────────────────────────
        $hero = Section::updateOrCreate(
            ['slug' => 'hero-basic'],
            [
                'name' => 'Hero — Basic',
                'version' => '1.0.0',
                'category' => 'hero',
                'icon' => 'Sparkles',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => ['eyebrow', 'title', 'subtitle', 'alignment', 'cta_label', 'cta_href', 'background_image'],
                    'properties' => [
                        'eyebrow' => [
                            'type' => 'string',
                            'title' => 'Eyebrow',
                            'maxLength' => 80,
                            'placeholder' => 'Ramadan 2026',
                            'description' => 'Small label shown above the title.',
                        ],
                        'title' => [
                            'type' => 'string',
                            'title' => 'Title',
                            'minLength' => 1,
                            'maxLength' => 200,
                            'placeholder' => 'Support our students',
                        ],
                        'subtitle' => [
                            'type' => 'string',
                            'title' => 'Subtitle',
                            'format' => 'textarea',
                            'maxLength' => 500,
                            'description' => 'A short paragraph below the title.',
                        ],
                        'cta_label' => [
                            'type' => 'string',
                            'title' => 'CTA label',
                            'maxLength' => 64,
                            'placeholder' => 'Donate now',
                        ],
                        'cta_href' => [
                            'type' => 'string',
                            'title' => 'CTA link',
                            'format' => 'url',
                            'maxLength' => 255,
                            'placeholder' => 'https://…',
                        ],
                        'background_image' => [
                            'type' => 'string',
                            'title' => 'Background image',
                            'format' => 'image',
                            'nullable' => true,
                            'description' => 'Optional image behind the hero.',
                        ],
                        'alignment' => [
                            'type' => 'string',
                            'title' => 'Alignment',
                            'enum' => ['start', 'center'],
                            'enumLabels' => ['start' => 'Start', 'center' => 'Center'],
                        ],
                    ],
                    'required' => ['title'],
                ],
                'default_settings_json' => [
                    'eyebrow' => 'Welcome',
                    'title' => 'Your hero title goes here',
                    'subtitle' => 'A short, persuasive sentence about what you do.',
                    'cta_label' => 'Get started',
                    'cta_href' => '#',
                    'background_image' => null,
                    'alignment' => 'center',
                ],
            ]
        );

        // ─── Section: paragraph ───────────────────────────────
        $paragraph = Section::updateOrCreate(
            ['slug' => 'paragraph'],
            [
                'name' => 'Paragraph',
                'version' => '1.0.0',
                'category' => 'content',
                'icon' => 'AlignLeft',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => ['heading', 'body', 'max_width'],
                    'properties' => [
                        'heading' => [
                            'type' => 'string',
                            'title' => 'Heading',
                            'maxLength' => 200,
                            'placeholder' => 'About us',
                        ],
                        'body' => [
                            'type' => 'string',
                            'title' => 'Body',
                            'format' => 'textarea',
                            'minLength' => 1,
                            'description' => 'Plain text or basic line breaks.',
                        ],
                        'max_width' => [
                            'type' => 'string',
                            'title' => 'Max width',
                            'enum' => ['narrow', 'normal', 'wide'],
                            'enumLabels' => [
                                'narrow' => 'Narrow',
                                'normal' => 'Normal',
                                'wide' => 'Wide',
                            ],
                            'description' => 'How wide the content column should be.',
                        ],
                    ],
                    'required' => ['body'],
                ],
                'default_settings_json' => [
                    'heading' => 'About us',
                    'body' => 'Tell your story here. A paragraph or two about your mission, history, or values.',
                    'max_width' => 'normal',
                ],
            ]
        );

        // ─── Theme: compassion ────────────────────────────────
        $compassion = Theme::updateOrCreate(
            ['slug' => 'compassion'],
            [
                'name' => 'Compassion',
                'version' => '1.0.0',
                'author' => 'JamiyaWeb',
                'preview_url' => null,
                'is_active' => true,
                'is_default' => true,
                'sort_order' => 10,
                'supported_types' => ['welfare'],
                'manifest_json' => [
                    'id' => 'compassion',
                    'name' => 'Compassion',
                    'version' => '1.0.0',
                    'engine' => '>=1.0.0 <2.0.0',
                    'supported_types' => ['welfare'],
                    'default_pages' => ['home'],
                ],
                'tokens_json' => [
                    'color.primary'    => ['type' => 'color', 'default' => '#20665c', 'label' => 'Primary'],
                    'color.accent'     => ['type' => 'color', 'default' => '#c18f2c', 'label' => 'Accent'],
                    'color.background' => ['type' => 'color', 'default' => '#fbfaf7', 'label' => 'Background'],
                    'color.foreground' => ['type' => 'color', 'default' => '#0c1f1c', 'label' => 'Text'],
                    'font.heading'     => ['type' => 'font',  'default' => 'geist',   'label' => 'Heading font'],
                    'font.body'        => ['type' => 'font',  'default' => 'geist',   'label' => 'Body font'],
                    'radius.card'      => ['type' => 'size',  'default' => '16px',    'label' => 'Card radius'],
                ],
            ]
        );

        // ─── Compose Compassion theme with both sections ──────
        $compassion->sections()->syncWithoutDetaching([
            $hero->id      => ['sort_order' => 1, 'is_required' => true],
            $paragraph->id => ['sort_order' => 2, 'is_required' => false],
        ]);
    }
}
