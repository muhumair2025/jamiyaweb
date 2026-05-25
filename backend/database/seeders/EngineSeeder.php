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

        // ─── Section: feature-grid ────────────────────────────
        $featureGrid = Section::updateOrCreate(
            ['slug' => 'feature-grid'],
            [
                'name' => 'Feature grid (3 columns)',
                'version' => '1.0.0',
                'category' => 'content',
                'icon' => 'LayoutGrid',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => [
                        'eyebrow', 'heading', 'subheading',
                        'feature_1_icon', 'feature_1_title', 'feature_1_desc',
                        'feature_2_icon', 'feature_2_title', 'feature_2_desc',
                        'feature_3_icon', 'feature_3_title', 'feature_3_desc',
                    ],
                    'properties' => [
                        'eyebrow' => [
                            'type' => 'string', 'title' => 'Eyebrow', 'maxLength' => 80,
                            'placeholder' => 'What we do',
                        ],
                        'heading' => [
                            'type' => 'string', 'title' => 'Heading', 'maxLength' => 200,
                            'placeholder' => 'What we offer',
                        ],
                        'subheading' => [
                            'type' => 'string', 'title' => 'Subheading',
                            'format' => 'textarea', 'maxLength' => 400,
                        ],
                        'feature_1_icon' => self::iconProp('Feature 1 — icon', 'Sparkles'),
                        'feature_1_title' => ['type' => 'string', 'title' => 'Feature 1 — title', 'maxLength' => 80],
                        'feature_1_desc' => ['type' => 'string', 'title' => 'Feature 1 — description', 'format' => 'textarea', 'maxLength' => 300],
                        'feature_2_icon' => self::iconProp('Feature 2 — icon', 'Heart'),
                        'feature_2_title' => ['type' => 'string', 'title' => 'Feature 2 — title', 'maxLength' => 80],
                        'feature_2_desc' => ['type' => 'string', 'title' => 'Feature 2 — description', 'format' => 'textarea', 'maxLength' => 300],
                        'feature_3_icon' => self::iconProp('Feature 3 — icon', 'Award'),
                        'feature_3_title' => ['type' => 'string', 'title' => 'Feature 3 — title', 'maxLength' => 80],
                        'feature_3_desc' => ['type' => 'string', 'title' => 'Feature 3 — description', 'format' => 'textarea', 'maxLength' => 300],
                    ],
                    'required' => ['heading'],
                ],
                'default_settings_json' => [
                    'eyebrow' => 'What we offer',
                    'heading' => 'Built around your community',
                    'subheading' => 'Three things every Jamiya needs from day one.',
                    'feature_1_icon' => 'BookOpen',
                    'feature_1_title' => 'Daily classes',
                    'feature_1_desc' => 'Quran, Tafsir, Fiqh and Arabic — scheduled and searchable.',
                    'feature_2_icon' => 'HandHeart',
                    'feature_2_title' => 'Easy donations',
                    'feature_2_desc' => 'Accept zakat, sadaqah and campaign giving in a single click.',
                    'feature_3_icon' => 'Users',
                    'feature_3_title' => 'A real community',
                    'feature_3_desc' => 'Events, volunteer signup and newsletters — all in one place.',
                ],
            ]
        );

        // ─── Section: cta-band ────────────────────────────────
        $ctaBand = Section::updateOrCreate(
            ['slug' => 'cta-band'],
            [
                'name' => 'CTA band',
                'version' => '1.0.0',
                'category' => 'cta',
                'icon' => 'Megaphone',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => ['heading', 'subheading', 'button_label', 'button_href', 'style'],
                    'properties' => [
                        'heading' => [
                            'type' => 'string', 'title' => 'Heading',
                            'minLength' => 1, 'maxLength' => 200,
                            'placeholder' => 'Ready to get started?',
                        ],
                        'subheading' => [
                            'type' => 'string', 'title' => 'Subheading',
                            'format' => 'textarea', 'maxLength' => 400,
                        ],
                        'button_label' => [
                            'type' => 'string', 'title' => 'Button label',
                            'maxLength' => 64, 'placeholder' => 'Get started',
                        ],
                        'button_href' => [
                            'type' => 'string', 'title' => 'Button link',
                            'format' => 'url', 'maxLength' => 255,
                            'placeholder' => 'https://…',
                        ],
                        'style' => [
                            'type' => 'string', 'title' => 'Style',
                            'enum' => ['dark', 'light'],
                            'enumLabels' => ['dark' => 'Dark band', 'light' => 'Light band'],
                            'description' => 'Dark uses your primary colour; Light uses the page background.',
                        ],
                    ],
                    'required' => ['heading'],
                ],
                'default_settings_json' => [
                    'heading' => 'Support our students this month',
                    'subheading' => 'Every donation funds books, meals and tuition for a real Jamiya.',
                    'button_label' => 'Donate now',
                    'button_href' => '#donate',
                    'style' => 'dark',
                ],
            ]
        );

        // ─── Theme: Starter (default, supports BOTH website types) ───────
        $starter = Theme::updateOrCreate(
            ['slug' => 'starter'],
            [
                'name' => 'Starter',
                'version' => '1.0.0',
                'author' => 'JamiyaWeb',
                'preview_url' => null,
                'is_active' => true,
                'is_default' => true,
                'sort_order' => 1,
                'supported_types' => ['welfare', 'scholar'],
                'manifest_json' => [
                    'id' => 'starter',
                    'name' => 'Starter',
                    'version' => '1.0.0',
                    'engine' => '>=1.0.0 <2.0.0',
                    'supported_types' => ['welfare', 'scholar'],
                    'default_pages' => ['home'],
                ],
                'tokens_json' => self::defaultTokens(),
            ]
        );
        $starter->sections()->sync([
            $hero->id        => ['sort_order' => 1, 'is_required' => true],
            $featureGrid->id => ['sort_order' => 2, 'is_required' => false],
            $paragraph->id   => ['sort_order' => 3, 'is_required' => false],
            $ctaBand->id     => ['sort_order' => 4, 'is_required' => false],
        ]);

        // ─── Theme: Compassion (welfare-only, no longer default) ─────────
        $compassion = Theme::updateOrCreate(
            ['slug' => 'compassion'],
            [
                'name' => 'Compassion',
                'version' => '1.0.0',
                'author' => 'JamiyaWeb',
                'preview_url' => null,
                'is_active' => true,
                'is_default' => false,
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
                'tokens_json' => self::defaultTokens(),
            ]
        );
        $compassion->sections()->sync([
            $hero->id        => ['sort_order' => 1, 'is_required' => true],
            $featureGrid->id => ['sort_order' => 2, 'is_required' => false],
            $paragraph->id   => ['sort_order' => 3, 'is_required' => false],
            $ctaBand->id     => ['sort_order' => 4, 'is_required' => false],
        ]);
    }

    /** Shared default tokens reused across themes. */
    private static function defaultTokens(): array
    {
        return [
            'color.primary'    => ['type' => 'color', 'default' => '#20665c', 'label' => 'Primary'],
            'color.accent'     => ['type' => 'color', 'default' => '#c18f2c', 'label' => 'Accent'],
            'color.background' => ['type' => 'color', 'default' => '#fbfaf7', 'label' => 'Background'],
            'color.foreground' => ['type' => 'color', 'default' => '#0c1f1c', 'label' => 'Text'],
            'font.heading'     => ['type' => 'font',  'default' => 'geist',   'label' => 'Heading font'],
            'font.body'        => ['type' => 'font',  'default' => 'geist',   'label' => 'Body font'],
            'radius.card'      => ['type' => 'size',  'default' => '16px',    'label' => 'Card radius'],
        ];
    }

    /** Helper to keep the icon select definition DRY for feature-grid. */
    private static function iconProp(string $title, string $default): array
    {
        return [
            'type' => 'string',
            'title' => $title,
            'default' => $default,
            'enum' => [
                'Sparkles', 'Heart', 'Award', 'BookOpen', 'Users', 'Star',
                'Compass', 'HandHeart', 'Globe', 'Mail', 'Phone', 'Calendar',
            ],
        ];
    }
}
