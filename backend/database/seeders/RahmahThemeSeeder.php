<?php

namespace Database\Seeders;

use App\Models\Section;
use App\Models\Theme;
use Illuminate\Database\Seeder;

/**
 * Rahmah — the first premium welfare-trust theme.
 *
 * Ships:
 *   1. Three additional section types — team, faq, image-gallery — that
 *      welfare sites lean on heavily.
 *   2. The Rahmah theme record with warm-traditional identity tokens.
 *   3. Five pre-baked pages (Home / About / Programs / Donate / Contact)
 *      with welfare-flavoured copy and curated Unsplash imagery.
 *   4. Default global header + footer that ship with the theme — when a
 *      user picks Rahmah, WebsiteCreator copies them onto websites.header_json
 *      and footer_json so the site has navigation out of the box.
 *
 * Idempotent. Safe to re-run via:
 *   php artisan db:seed --class=RahmahThemeSeeder
 */
class RahmahThemeSeeder extends Seeder
{
    /**
     * Unsplash CDN URL builder. Photos are picked for stability — these
     * IDs have been around for years and are unlikely to be unpublished.
     * If any image 404s, the section components have gradient fallbacks
     * so the layout still reads correctly.
     */
    private static function unsplash(string $id, int $w = 1600): string
    {
        return "https://images.unsplash.com/photo-{$id}?w={$w}&q=80&auto=format&fit=crop";
    }

    public function run(): void
    {
        // ──────────────────────────────────────────────────────
        // 1. SECTIONS — team, faq, image-gallery
        // ──────────────────────────────────────────────────────

        Section::updateOrCreate(
            ['slug' => 'team'],
            [
                'name' => 'Team / Scholars',
                'version' => '1.0.0',
                'category' => 'content',
                'icon' => 'Users',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => ['eyebrow', 'heading', 'subheading', 'columns', 'people'],
                    'properties' => [
                        'eyebrow' => ['type' => 'string', 'title' => 'Eyebrow', 'maxLength' => 80],
                        'heading' => ['type' => 'string', 'title' => 'Heading', 'maxLength' => 200],
                        'subheading' => ['type' => 'string', 'title' => 'Subheading', 'format' => 'textarea', 'maxLength' => 400],
                        'columns' => [
                            'type' => 'string', 'title' => 'Columns',
                            'enum' => ['2', '3', '4'],
                            'enumLabels' => ['2' => '2 columns', '3' => '3 columns', '4' => '4 columns'],
                        ],
                        'people' => [
                            'type' => 'array',
                            'title' => 'People',
                            'maxItems' => 20,
                            'addLabel' => 'Add person',
                            'itemLabel' => '{name}',
                            'items' => [
                                'type' => 'object',
                                'fieldOrder' => ['photo', 'name', 'role', 'bio', 'email', 'twitter', 'website'],
                                'properties' => [
                                    'photo' => ['type' => 'string', 'title' => 'Photo', 'format' => 'image', 'nullable' => true],
                                    'name' => ['type' => 'string', 'title' => 'Name', 'maxLength' => 120],
                                    'role' => ['type' => 'string', 'title' => 'Role', 'maxLength' => 120],
                                    'bio' => ['type' => 'string', 'title' => 'Bio', 'format' => 'textarea', 'maxLength' => 500],
                                    'email' => ['type' => 'string', 'title' => 'Email', 'maxLength' => 120],
                                    'twitter' => ['type' => 'string', 'title' => 'Twitter / X URL', 'format' => 'url', 'maxLength' => 255],
                                    'website' => ['type' => 'string', 'title' => 'Website', 'format' => 'url', 'maxLength' => 255],
                                ],
                                'required' => ['name'],
                            ],
                        ],
                    ],
                    'required' => ['heading'],
                ],
                'default_settings_json' => [
                    'eyebrow' => 'Our team',
                    'heading' => 'The hands behind the work',
                    'subheading' => 'Scholars, fundraisers and field workers — committed to your trust.',
                    'columns' => '3',
                    'people' => [],
                ],
            ]
        );

        Section::updateOrCreate(
            ['slug' => 'faq'],
            [
                'name' => 'FAQ',
                'version' => '1.0.0',
                'category' => 'content',
                'icon' => 'HelpCircle',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => ['eyebrow', 'heading', 'subheading', 'allow_multiple', 'questions'],
                    'properties' => [
                        'eyebrow' => ['type' => 'string', 'title' => 'Eyebrow', 'maxLength' => 80],
                        'heading' => ['type' => 'string', 'title' => 'Heading', 'maxLength' => 200],
                        'subheading' => ['type' => 'string', 'title' => 'Subheading', 'format' => 'textarea', 'maxLength' => 400],
                        'allow_multiple' => ['type' => 'boolean', 'title' => 'Allow multiple open', 'description' => 'When off, opening one item closes the others.'],
                        'questions' => [
                            'type' => 'array',
                            'title' => 'Questions',
                            'minItems' => 1, 'maxItems' => 30,
                            'addLabel' => 'Add question',
                            'itemLabel' => 'Q{index}: {question}',
                            'items' => [
                                'type' => 'object',
                                'fieldOrder' => ['question', 'answer'],
                                'properties' => [
                                    'question' => ['type' => 'string', 'title' => 'Question', 'maxLength' => 240],
                                    'answer' => ['type' => 'string', 'title' => 'Answer', 'format' => 'textarea', 'maxLength' => 1500],
                                ],
                                'required' => ['question', 'answer'],
                            ],
                        ],
                    ],
                    'required' => ['heading'],
                ],
                'default_settings_json' => [
                    'eyebrow' => 'FAQ',
                    'heading' => 'Questions, answered',
                    'subheading' => '',
                    'allow_multiple' => false,
                    'questions' => [
                        ['question' => 'How is my donation used?', 'answer' => 'Every rupee donated is allocated to a specific programme — orphan sponsorship, scholarships, or relief — based on the campaign you contributed to. We publish audited quarterly reports.'],
                        ['question' => 'Is my donation Zakat-eligible?', 'answer' => 'Yes. Our scholarship and orphan-care programmes qualify for Zakat under the rulings of our advisory board.'],
                        ['question' => 'Do you accept international donations?', 'answer' => 'Yes. We accept PKR, USD, GBP, SAR and AED. International donors can give via card, bank transfer or PayPal.'],
                        ['question' => 'Can I sponsor a specific child?', 'answer' => 'Yes. Our Orphan Sponsorship programme matches you with a child. You receive quarterly updates and an annual report from the field.'],
                    ],
                ],
            ]
        );

        Section::updateOrCreate(
            ['slug' => 'image-gallery'],
            [
                'name' => 'Image gallery',
                'version' => '1.0.0',
                'category' => 'content',
                'icon' => 'Images',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => ['eyebrow', 'heading', 'subheading', 'layout', 'images'],
                    'properties' => [
                        'eyebrow' => ['type' => 'string', 'title' => 'Eyebrow', 'maxLength' => 80],
                        'heading' => ['type' => 'string', 'title' => 'Heading', 'maxLength' => 200],
                        'subheading' => ['type' => 'string', 'title' => 'Subheading', 'format' => 'textarea', 'maxLength' => 400],
                        'layout' => [
                            'type' => 'string', 'title' => 'Layout',
                            'enum' => ['grid', 'masonry'],
                            'enumLabels' => ['grid' => 'Uniform grid', 'masonry' => 'Masonry (photo essay)'],
                        ],
                        'images' => [
                            'type' => 'array',
                            'title' => 'Images',
                            'minItems' => 1, 'maxItems' => 30,
                            'addLabel' => 'Add image',
                            'itemLabel' => 'Image {index}',
                            'items' => [
                                'type' => 'object',
                                'fieldOrder' => ['image', 'caption', 'alt'],
                                'properties' => [
                                    'image' => ['type' => 'string', 'title' => 'Image', 'format' => 'image', 'nullable' => true],
                                    'caption' => ['type' => 'string', 'title' => 'Caption', 'maxLength' => 200],
                                    'alt' => ['type' => 'string', 'title' => 'Alt text', 'maxLength' => 200, 'description' => 'For screen readers + SEO.'],
                                ],
                                'required' => ['image'],
                            ],
                        ],
                    ],
                    'required' => ['heading'],
                ],
                'default_settings_json' => [
                    'eyebrow' => 'Photo essay',
                    'heading' => 'From the field',
                    'subheading' => 'A glimpse of the lives your generosity has touched.',
                    'layout' => 'masonry',
                    'images' => [],
                ],
            ]
        );

        // ──────────────────────────────────────────────────────
        // 2. RAHMAH THEME
        // ──────────────────────────────────────────────────────

        $rahmah = Theme::updateOrCreate(
            ['slug' => 'rahmah'],
            [
                'name' => 'Rahmah',
                'version' => '1.0.0',
                'author' => 'JamiyaWeb',
                'preview_url' => null,
                'is_active' => true,
                'is_default' => false,
                'sort_order' => 1, // ahead of Starter for welfare users
                'supported_types' => ['welfare'],
                'manifest_json' => [
                    'id' => 'rahmah',
                    'name' => 'Rahmah',
                    'version' => '1.0.0',
                    'engine' => '>=1.0.0 <2.0.0',
                    'supported_types' => ['welfare'],
                    'default_pages' => ['home', 'about', 'programs', 'donate', 'contact'],
                    'description' => 'Warm-traditional welfare theme — deep emerald, warm gold, editorial typography. Built for established trusts that want a premium, hand-designed feel.',
                ],
                'tokens_json' => [
                    // Institutional teal — modelled on msaee.sa / wusul.org.sa
                    // palettes: deeper, less saturated than a bright emerald.
                    'color.primary'    => ['type' => 'color', 'default' => '#1a5f6e', 'label' => 'Primary'],
                    // Refined gold — warmer and softer than the previous brassy
                    // accent. Used for dividers, KPI underlines, project CTAs.
                    'color.accent'     => ['type' => 'color', 'default' => '#c9a25e', 'label' => 'Accent'],
                    // Warm off-white background — gives the editorial / Saudi
                    // welfare feel without going stark white.
                    'color.background' => ['type' => 'color', 'default' => '#f6f5f1', 'label' => 'Background'],
                    'color.foreground' => ['type' => 'color', 'default' => '#1f2a2a', 'label' => 'Text'],
                    'font.heading'     => ['type' => 'font',  'default' => "'Playfair Display', serif", 'label' => 'Heading font'],
                    'font.body'        => ['type' => 'font',  'default' => "'Lora', serif",            'label' => 'Body font'],
                    'radius.card'      => ['type' => 'size',  'default' => '16px',    'label' => 'Card radius'],
                ],
                'default_header_json' => self::headerTemplate(),
                'default_footer_json' => self::footerTemplate(),
                'default_pages_json' => self::pages(),
            ]
        );

        // Section pivot — every section the theme uses, in default sort order.
        $sectionIds = Section::query()
            ->whereIn('slug', [
                'site-header', 'site-footer',
                'hero-basic', 'section-divider', 'service-pillars', 'stats-counter',
                'programs-grid', 'donation-widget', 'partners-strip',
                'testimonials', 'team', 'image-gallery', 'faq',
                'paragraph', 'contact-form', 'feature-grid', 'cta-band',
            ])
            ->pluck('id', 'slug');

        $pivot = [];
        $order = 1;
        foreach ([
            'hero-basic', 'section-divider', 'service-pillars', 'stats-counter',
            'programs-grid', 'donation-widget', 'partners-strip',
            'testimonials', 'team', 'image-gallery', 'faq',
            'paragraph', 'contact-form', 'feature-grid', 'cta-band',
        ] as $slug) {
            if (isset($sectionIds[$slug])) {
                $pivot[$sectionIds[$slug]] = [
                    'sort_order' => $order++,
                    'is_required' => $slug === 'hero-basic',
                ];
            }
        }
        $rahmah->sections()->sync($pivot);
    }

    // ──────────────────────────────────────────────────────────
    // GLOBAL HEADER + FOOTER TEMPLATES
    // ──────────────────────────────────────────────────────────

    private static function headerTemplate(): array
    {
        return [
            'type' => 'site-header',
            'settings' => [
                'logo' => null,
                'logo_text' => 'Rahmah Trust',
                'sticky' => true,
                'layout' => 'right',
                'links' => [
                    ['label' => 'Home', 'href' => '/'],
                    ['label' => 'About', 'href' => '/about'],
                    ['label' => 'Programs', 'href' => '/programs'],
                    ['label' => 'Donate', 'href' => '/donate'],
                    ['label' => 'Contact', 'href' => '/contact'],
                ],
                'cta_label' => 'Donate',
                'cta_href' => '/donate',
                // Utility bar enabled by default — matches reference sites
                'show_utility_bar' => true,
                'utility_phone' => '+92 21 0000 0000',
                'utility_email' => 'hello@rahmahtrust.org',
                'utility_language_label' => 'العربية',
                'utility_language_href' => '/ar',
                'utility_login_label' => 'Donor login',
                'utility_login_href' => '/login',
                'utility_links' => [
                    ['label' => 'Annual report', 'href' => '/about#report'],
                ],
            ],
        ];
    }

    private static function footerTemplate(): array
    {
        return [
            'type' => 'site-footer',
            'settings' => [
                'logo' => null,
                'tagline' => 'A registered welfare trust caring for orphans, supporting students, and bringing relief where it\'s needed — since 2008.',
                'contact_email' => 'hello@rahmahtrust.org',
                'contact_phone' => '+92 21 0000 0000',
                'address' => "14, Stadium Road\nKarachi 75500, Pakistan",
                'show_brand_strip' => true,
                // Trust strip — welfare-site convention
                'iban' => 'PK00 BANK 0000 0000 0000 0000',
                'bank_name' => 'Bank IBAN — donations',
                'license_number' => 'PCP-Reg-21-0099',
                'license_authority' => 'Pakistan Centre for Philanthropy',
                'regulatory_note' => 'Audited annually by an independent CA firm. Quarterly impact reports published publicly.',
                'columns' => [
                    [
                        'heading' => 'About',
                        'links' => [
                            ['label' => 'Our story', 'href' => '/about'],
                            ['label' => 'Leadership', 'href' => '/about#team'],
                            ['label' => 'Annual report', 'href' => '/about#report'],
                        ],
                    ],
                    [
                        'heading' => 'Programs',
                        'links' => [
                            ['label' => 'Orphan sponsorship', 'href' => '/programs#orphans'],
                            ['label' => 'Scholarships', 'href' => '/programs#scholarships'],
                            ['label' => 'Emergency relief', 'href' => '/programs#relief'],
                        ],
                    ],
                    [
                        'heading' => 'Get involved',
                        'links' => [
                            ['label' => 'Donate', 'href' => '/donate'],
                            ['label' => 'Volunteer', 'href' => '/contact'],
                            ['label' => 'Partner with us', 'href' => '/contact'],
                        ],
                    ],
                ],
                'socials' => [
                    ['platform' => 'facebook', 'href' => 'https://facebook.com/'],
                    ['platform' => 'instagram', 'href' => 'https://instagram.com/'],
                    ['platform' => 'youtube', 'href' => 'https://youtube.com/'],
                    ['platform' => 'twitter', 'href' => 'https://twitter.com/'],
                ],
                'copyright' => '© {year} Rahmah Trust. All rights reserved.',
            ],
        ];
    }

    // ──────────────────────────────────────────────────────────
    // PAGES — slug => { title, is_homepage, sort_order, sections }
    // ──────────────────────────────────────────────────────────

    private static function pages(): array
    {
        return [
            'home' => self::homePage(),
            'about' => self::aboutPage(),
            'programs' => self::programsPage(),
            'donate' => self::donatePage(),
            'contact' => self::contactPage(),
        ];
    }

    private static function homePage(): array
    {
        return [
            'title' => 'Home',
            'is_homepage' => true,
            'sort_order' => 0,
            'seo' => [
                'title' => 'Rahmah Trust — Caring for orphans, supporting students',
                'description' => 'A registered welfare trust serving orphans, students and families in need across Pakistan and beyond.',
            ],
            'sections' => [
                [
                    'type' => 'hero-basic',
                    'settings' => [
                        'eyebrow' => 'Ramadan 2026',
                        'title' => 'Mercy that reaches further than you know',
                        'subtitle' => 'Sponsor a student, support a family, fund a campaign — your generosity changes lives, in shaa Allah.',
                        'cta_label' => 'Donate now',
                        'cta_href' => '/donate',
                        'background_image' => self::unsplash('1542816417-0983c9c9ad53'),
                        'alignment' => 'center',
                    ],
                ],
                // Ornamental gold divider — the signature welfare-site move
                ['type' => 'section-divider', 'settings' => ['style' => 'ornament', 'width' => 'normal', 'color' => '']],
                // Service pillars (4-column "what we offer")
                [
                    'type' => 'service-pillars',
                    'settings' => [
                        'eyebrow' => 'What we offer',
                        'heading' => 'Built around the people who need it most',
                        'subheading' => 'Focused services, transparent reporting, lived experience on the ground.',
                        'columns' => '4',
                        'style' => 'cards',
                        'pillars' => [
                            ['icon' => 'HandHeart', 'title' => 'Orphan care', 'description' => 'Monthly food, schooling and shelter for children in our trust.', 'link_label' => 'Learn more', 'link_href' => '/programs#orphans'],
                            ['icon' => 'GraduationCap', 'title' => 'Scholarships', 'description' => 'Full-tuition Quran and Islamic-sciences scholarships at partner Jamiyas.', 'link_label' => 'Apply', 'link_href' => '/programs#scholarships'],
                            ['icon' => 'Heart', 'title' => 'Emergency relief', 'description' => 'Rapid-response food, water and medical aid in crisis zones.', 'link_label' => 'Donate', 'link_href' => '/programs#relief'],
                            ['icon' => 'Users', 'title' => 'Family sponsorship', 'description' => 'Monthly support for widowed mothers and their children.', 'link_label' => 'Sponsor', 'link_href' => '/programs#widows'],
                        ],
                    ],
                ],
                ['type' => 'section-divider', 'settings' => ['style' => 'ornament', 'width' => 'normal', 'color' => '']],
                [
                    'type' => 'stats-counter',
                    'settings' => [
                        'eyebrow' => 'Impact so far',
                        'heading' => 'Numbers that mean lives',
                        'subheading' => 'Every figure here is an audited, traceable story.',
                        'layout' => 'minimal',
                        'stats' => [
                            ['number' => 12500, 'suffix' => '+', 'label' => 'Donors', 'description' => 'Across 18 countries.'],
                            ['number' => 380, 'suffix' => '', 'label' => 'Students sponsored', 'description' => 'Full-tuition scholarships this year.'],
                            ['number' => 1240, 'suffix' => '', 'label' => 'Orphans in care', 'description' => 'Monthly support + schooling.'],
                            ['number' => 96, 'suffix' => '%', 'label' => 'Goes to programs', 'description' => 'Independently audited.'],
                        ],
                    ],
                ],
                ['type' => 'section-divider', 'settings' => ['style' => 'ornament', 'width' => 'normal', 'color' => '']],
                // Donation projects — extended programs-grid in project mode
                [
                    'type' => 'programs-grid',
                    'settings' => [
                        'eyebrow' => 'Active campaigns',
                        'heading' => 'Donate to a live project',
                        'subheading' => 'Real campaigns, real numbers, real impact reports.',
                        'mode' => 'project',
                        'columns' => '3',
                        'programs' => [
                            ['image' => self::unsplash('1517486808906-6ca8b3f04846'), 'title' => 'Sponsor 50 orphans', 'description' => 'Monthly food, schooling, and healthcare for 50 children in our Karachi station.', 'link_label' => 'Details', 'link_href' => '/programs#orphans', 'raised' => 2750000, 'goal' => 4500000, 'currency' => 'PKR ', 'donate_label' => 'Donate now', 'donate_href' => '/donate?cause=orphan-50'],
                            ['image' => self::unsplash('1591622702522-1c2cbf21796f'), 'title' => 'Ramadan family iftar drive', 'description' => 'Feed 1,000 families for the entire month of Ramadan, in shaa Allah.', 'link_label' => 'Details', 'link_href' => '/programs#ramadan', 'raised' => 3120000, 'goal' => 8500000, 'currency' => 'PKR ', 'donate_label' => 'Donate now', 'donate_href' => '/donate?cause=ramadan-2026'],
                            ['image' => self::unsplash('1488521787991-ed7bbaae773c'), 'title' => 'Flood relief — Sindh', 'description' => 'Emergency food parcels and clean water for displaced families in three districts.', 'link_label' => 'Details', 'link_href' => '/programs#relief', 'raised' => 1380000, 'goal' => 2500000, 'currency' => 'PKR ', 'donate_label' => 'Donate now', 'donate_href' => '/donate?cause=flood'],
                        ],
                    ],
                ],
                ['type' => 'section-divider', 'settings' => ['style' => 'dots', 'width' => 'normal', 'color' => '']],
                [
                    'type' => 'donation-widget',
                    'settings' => [
                        'eyebrow' => 'Featured campaign',
                        'heading' => 'Ramadan 2026: feed a family for a month',
                        'description' => 'Rs 8,500 covers a family\'s essential food needs for the entire month of Ramadan. Help us reach 1,000 families this year, in shaa Allah.',
                        'currency' => 'PKR',
                        'goal' => 8500000,
                        'raised' => 3120000,
                        'quick_amounts' => '500, 1000, 8500, 25000, 50000',
                        'cta_label' => 'Donate this Ramadan',
                        'cta_href' => '/donate',
                        'layout' => 'card',
                    ],
                ],
                ['type' => 'section-divider', 'settings' => ['style' => 'ornament', 'width' => 'normal', 'color' => '']],
                [
                    'type' => 'testimonials',
                    'settings' => [
                        'eyebrow' => 'What donors say',
                        'heading' => 'Built on trust',
                        'layout' => 'carousel',
                        'testimonials' => [
                            ['quote' => 'Every quarter I get a real audited report. I know exactly which student my contribution reached. It changed my whole view of charity.', 'author' => 'Asma R.', 'role' => 'Donor — Karachi', 'avatar' => null],
                            ['quote' => 'I sponsored a student two years ago. Last month his teacher sent me a voice note of him reciting Surah Al-Kahf. That moment changed me.', 'author' => 'Yusuf I.', 'role' => 'Donor — London', 'avatar' => null],
                            ['quote' => 'Clean, transparent, easy. This is how charity should feel in 2026.', 'author' => 'Fatima S.', 'role' => 'Donor — Dubai', 'avatar' => null],
                        ],
                    ],
                ],
                ['type' => 'section-divider', 'settings' => ['style' => 'ornament', 'width' => 'normal', 'color' => '']],
                // Partners strip — trust signal. Empty by default; users add logos via the builder.
                [
                    'type' => 'partners-strip',
                    'settings' => [
                        'eyebrow' => 'Trusted by',
                        'heading' => 'Our partners and regulators',
                        'subheading' => '',
                        'layout' => 'grid',
                        'columns' => '5',
                        'grayscale' => true,
                        'partners' => [
                            ['logo' => null, 'name' => 'Pakistan Centre for Philanthropy', 'href' => ''],
                            ['logo' => null, 'name' => 'Sindh Welfare Council', 'href' => ''],
                            ['logo' => null, 'name' => 'Aga Khan Foundation', 'href' => ''],
                            ['logo' => null, 'name' => 'UN OCHA Pakistan', 'href' => ''],
                            ['logo' => null, 'name' => 'Islamic Relief Worldwide', 'href' => ''],
                        ],
                    ],
                ],
                [
                    'type' => 'cta-band',
                    'settings' => [
                        'heading' => 'Will you stand with them this month?',
                        'subheading' => 'Sadaqah jaariyah — a gift that keeps reaching them, long after you give it.',
                        'button_label' => 'Donate now',
                        'button_href' => '/donate',
                        'style' => 'dark',
                    ],
                ],
            ],
        ];
    }

    private static function aboutPage(): array
    {
        return [
            'title' => 'About',
            'is_homepage' => false,
            'sort_order' => 1,
            'seo' => [
                'title' => 'About Rahmah Trust',
                'description' => 'Our story, our team, our commitment to transparency.',
            ],
            'sections' => [
                [
                    'type' => 'hero-basic',
                    'settings' => [
                        'eyebrow' => 'About us',
                        'title' => 'A trust built on transparency, run by people you can name',
                        'subtitle' => 'Founded in 2008. Audited every quarter. Run by scholars and field workers who answer your messages personally.',
                        'cta_label' => '',
                        'cta_href' => '',
                        'background_image' => self::unsplash('1604881991720-f91add269bed'),
                        'alignment' => 'center',
                    ],
                ],
                [
                    'type' => 'paragraph',
                    'settings' => [
                        'heading' => 'Our story',
                        'body' => "Rahmah Trust began in a small office in Karachi in 2008 with three people, one Excel sheet and a list of forty orphans we had committed to feed.\n\nEighteen years later, that list is over a thousand names long. The Excel sheet has become a database with quarterly audits. The office has grown into seven field stations across Pakistan. But the principle hasn't moved an inch: every rupee is traceable, every story is real, and every donor is treated as an amanah-holder, not a transaction.\n\nWe are not the largest welfare trust in Pakistan. We do not want to be. We want to be the most trusted.",
                        'max_width' => 'normal',
                    ],
                ],
                [
                    'type' => 'stats-counter',
                    'settings' => [
                        'eyebrow' => 'Impact since 2008',
                        'heading' => 'Eighteen years, audited',
                        'subheading' => '',
                        'stats' => [
                            ['number' => 18, 'suffix' => '', 'label' => 'Years operating', 'description' => 'Continuously since 2008.'],
                            ['number' => 12500, 'suffix' => '+', 'label' => 'Donors trusted us', 'description' => 'Across 18 countries.'],
                            ['number' => 7, 'suffix' => '', 'label' => 'Field stations', 'description' => 'Across Pakistan.'],
                            ['number' => 96, 'suffix' => '%', 'label' => 'To program work', 'description' => 'Audited annually.'],
                        ],
                    ],
                ],
                [
                    'type' => 'team',
                    'settings' => [
                        'eyebrow' => 'Leadership',
                        'heading' => 'Meet the people behind the work',
                        'subheading' => 'Scholars and field workers who answer your emails personally.',
                        'columns' => '3',
                        'people' => [
                            ['photo' => null, 'name' => 'Mufti Abdul Rahman', 'role' => 'Founder & Chair', 'bio' => 'Senior scholar; oversees the trust\'s Shariah compliance and program integrity.', 'email' => '', 'twitter' => '', 'website' => ''],
                            ['photo' => null, 'name' => 'Aisha Khalid', 'role' => 'Executive Director', 'bio' => 'Twenty years in development. Runs day-to-day operations across all seven stations.', 'email' => '', 'twitter' => '', 'website' => ''],
                            ['photo' => null, 'name' => 'Hamza Yusuf', 'role' => 'Head of Programs', 'bio' => 'Designs and audits every program. Reports directly to donors quarterly.', 'email' => '', 'twitter' => '', 'website' => ''],
                        ],
                    ],
                ],
                [
                    'type' => 'cta-band',
                    'settings' => [
                        'heading' => 'Want to see our quarterly report?',
                        'subheading' => 'It\'s public. Every campaign, every rupee, audited and downloadable.',
                        'button_label' => 'Open the report',
                        'button_href' => '/report',
                        'style' => 'light',
                    ],
                ],
            ],
        ];
    }

    private static function programsPage(): array
    {
        return [
            'title' => 'Programs',
            'is_homepage' => false,
            'sort_order' => 2,
            'seo' => [
                'title' => 'Programs — Rahmah Trust',
                'description' => 'Orphan sponsorship, scholarships, emergency relief — and the audited stories behind each.',
            ],
            'sections' => [
                [
                    'type' => 'hero-basic',
                    'settings' => [
                        'eyebrow' => 'Our work',
                        'title' => 'Programs',
                        'subtitle' => 'Three focused areas. Eighteen years of refinement. Audited every quarter.',
                        'cta_label' => '',
                        'cta_href' => '',
                        'background_image' => self::unsplash('1592503249-7e54e1f86afb'),
                        'alignment' => 'center',
                    ],
                ],
                [
                    'type' => 'programs-grid',
                    'settings' => [
                        'eyebrow' => '',
                        'heading' => 'Where your gift goes',
                        'subheading' => '',
                        'columns' => '3',
                        'programs' => [
                            ['image' => self::unsplash('1517486808906-6ca8b3f04846'), 'title' => 'Orphan sponsorship', 'description' => 'Rs 5,500 / month sponsors one child — food, schooling, healthcare. Annual update from their teacher.', 'link_label' => 'Sponsor a child', 'link_href' => '/donate?cause=orphans'],
                            ['image' => self::unsplash('1591622702522-1c2cbf21796f'), 'title' => 'Madrasah scholarships', 'description' => 'Full-tuition support for Quran and Islamic-sciences students at our 24 partner Jamiyas.', 'link_label' => 'Apply', 'link_href' => '/donate?cause=scholarships'],
                            ['image' => self::unsplash('1488521787991-ed7bbaae773c'), 'title' => 'Emergency relief', 'description' => 'Rapid-response aid for flood, drought and displacement zones across Pakistan and South Asia.', 'link_label' => 'Donate', 'link_href' => '/donate?cause=relief'],
                            ['image' => self::unsplash('1604881991720-f91add269bed'), 'title' => 'Quran printing', 'description' => 'Sponsor printing and distribution of Mushaf-ash-Shareef to mosques and students.', 'link_label' => 'Sponsor a print run', 'link_href' => '/donate?cause=quran'],
                            ['image' => self::unsplash('1503676260728-1c00da094a0b'), 'title' => 'Widow support', 'description' => 'Monthly food + healthcare for widowed mothers caring for orphan children.', 'link_label' => 'Support a widow', 'link_href' => '/donate?cause=widows'],
                            ['image' => self::unsplash('1559027615-cd4628902d4a'), 'title' => 'Iftar campaigns', 'description' => 'Ramadan-only programme — feed a family for the full month with a single Rs 8,500 gift.', 'link_label' => 'Sponsor Ramadan', 'link_href' => '/donate?cause=ramadan'],
                        ],
                    ],
                ],
                [
                    'type' => 'image-gallery',
                    'settings' => [
                        'eyebrow' => 'From the field',
                        'heading' => 'Real photos, real lives',
                        'subheading' => 'Sent to us by our field teams. Used with the permission of those photographed.',
                        'layout' => 'masonry',
                        'images' => [
                            ['image' => self::unsplash('1517486808906-6ca8b3f04846'), 'caption' => 'Morning classes, partner madrasah, Karachi.', 'alt' => 'Children studying at a desk'],
                            ['image' => self::unsplash('1591622702522-1c2cbf21796f'), 'caption' => 'Mushaf distribution.', 'alt' => 'Open Quran on a wooden surface'],
                            ['image' => self::unsplash('1488521787991-ed7bbaae773c'), 'caption' => 'Flood relief — Sindh, 2025.', 'alt' => 'Hands reaching out'],
                            ['image' => self::unsplash('1503676260728-1c00da094a0b'), 'caption' => 'Boarding house, Lahore.', 'alt' => 'Child reading'],
                            ['image' => self::unsplash('1592503249-7e54e1f86afb'), 'caption' => 'Mosque renovation, Multan.', 'alt' => 'Mosque interior'],
                            ['image' => self::unsplash('1604881991720-f91add269bed'), 'caption' => 'Calligraphy class, scholarship cohort 2025.', 'alt' => 'Arabic calligraphy practice'],
                        ],
                    ],
                ],
                [
                    'type' => 'cta-band',
                    'settings' => [
                        'heading' => 'Pick a cause that moves you.',
                        'subheading' => 'Every program is audited. Every donation is allocated. Every story is real.',
                        'button_label' => 'Donate to a program',
                        'button_href' => '/donate',
                        'style' => 'dark',
                    ],
                ],
            ],
        ];
    }

    private static function donatePage(): array
    {
        return [
            'title' => 'Donate',
            'is_homepage' => false,
            'sort_order' => 3,
            'seo' => [
                'title' => 'Donate — Rahmah Trust',
                'description' => 'Donate to active campaigns. Zakat-eligible programs available.',
            ],
            'sections' => [
                [
                    'type' => 'hero-basic',
                    'settings' => [
                        'eyebrow' => 'Donate',
                        'title' => 'Your sadaqah, multiplied',
                        'subtitle' => 'Every donation is allocated, audited, and reported. Every story is real.',
                        'cta_label' => '',
                        'cta_href' => '',
                        'background_image' => self::unsplash('1488521787991-ed7bbaae773c'),
                        'alignment' => 'center',
                    ],
                ],
                [
                    'type' => 'donation-widget',
                    'settings' => [
                        'eyebrow' => 'Active campaign',
                        'heading' => 'Ramadan 2026: feed a family for a month',
                        'description' => 'Rs 8,500 covers a family\'s essential food needs for the entire month of Ramadan. 1,000-family goal, in shaa Allah.',
                        'currency' => 'PKR',
                        'goal' => 8500000,
                        'raised' => 3120000,
                        'quick_amounts' => '500, 1000, 8500, 25000, 50000',
                        'cta_label' => 'Donate to Ramadan campaign',
                        'cta_href' => '#donate-ramadan',
                        'layout' => 'banner',
                    ],
                ],
                [
                    'type' => 'programs-grid',
                    'settings' => [
                        'eyebrow' => 'Other ways to give',
                        'heading' => 'Pick a program',
                        'subheading' => '',
                        'columns' => '3',
                        'programs' => [
                            ['image' => self::unsplash('1517486808906-6ca8b3f04846'), 'title' => 'Sponsor an orphan', 'description' => 'Rs 5,500 / month. Full update from their teacher annually.', 'link_label' => 'Sponsor now', 'link_href' => '#orphan'],
                            ['image' => self::unsplash('1591622702522-1c2cbf21796f'), 'title' => 'Fund a scholarship', 'description' => 'Rs 18,000 / year covers one madrasah student\'s tuition + boarding.', 'link_label' => 'Sponsor a student', 'link_href' => '#scholarship'],
                            ['image' => self::unsplash('1488521787991-ed7bbaae773c'), 'title' => 'Emergency relief', 'description' => 'Any amount — pooled and dispatched to active crisis zones.', 'link_label' => 'Donate to relief', 'link_href' => '#relief'],
                        ],
                    ],
                ],
                [
                    'type' => 'faq',
                    'settings' => [
                        'eyebrow' => 'Before you give',
                        'heading' => 'Common questions about donating',
                        'subheading' => '',
                        'allow_multiple' => false,
                        'questions' => [
                            ['question' => 'Is my donation Zakat-eligible?', 'answer' => 'Yes — our Orphan Sponsorship, Madrasah Scholarship, and Widow Support programs all qualify for Zakat under the rulings of our Shariah advisory board (chaired by Mufti Abdul Rahman). Emergency relief is sadaqah only, not Zakat.'],
                            ['question' => 'What payment methods do you accept?', 'answer' => 'Card (Visa, Mastercard), bank transfer (PKR), PayPal (USD, GBP), and bank deposit for international donors (SAR, AED, USD). All processing fees are absorbed by us — the full amount you give reaches the program.'],
                            ['question' => 'Will I get a receipt?', 'answer' => 'Yes — an instant emailed receipt suitable for tax deduction in Pakistan, UK, USA and most GCC countries.'],
                            ['question' => 'Can I give in someone\'s name?', 'answer' => 'Yes. Sadaqah on behalf of a deceased relative, parent or teacher is a common request. Just add their name in the donation note — we record it in the campaign log.'],
                            ['question' => 'How do I know my donation actually arrived?', 'answer' => 'You get a quarterly impact report by email tied to the campaign or beneficiary you supported. For orphan sponsorship, you receive an annual update from the child\'s teacher.'],
                            ['question' => 'Can I cancel a recurring donation?', 'answer' => 'Anytime — one click in your donor dashboard. No questions, no hold periods.'],
                        ],
                    ],
                ],
                [
                    'type' => 'cta-band',
                    'settings' => [
                        'heading' => 'Have a question we didn\'t cover?',
                        'subheading' => 'Our donor relations team replies within one business day.',
                        'button_label' => 'Contact us',
                        'button_href' => '/contact',
                        'style' => 'light',
                    ],
                ],
            ],
        ];
    }

    private static function contactPage(): array
    {
        return [
            'title' => 'Contact',
            'is_homepage' => false,
            'sort_order' => 4,
            'seo' => [
                'title' => 'Contact Rahmah Trust',
                'description' => 'Get in touch with our donor relations and field teams.',
            ],
            'sections' => [
                [
                    'type' => 'hero-basic',
                    'settings' => [
                        'eyebrow' => 'Contact',
                        'title' => 'We answer every message',
                        'subtitle' => 'Donations, partnerships, sponsorship questions — pick the right team and we\'ll get back to you within one business day.',
                        'cta_label' => '',
                        'cta_href' => '',
                        'background_image' => null,
                        'alignment' => 'center',
                    ],
                ],
                [
                    'type' => 'contact-form',
                    'settings' => [
                        'eyebrow' => '',
                        'heading' => 'Send us a message',
                        'subheading' => 'Use the form below. For urgent donor queries, call the number at the bottom.',
                        'show_phone' => true,
                        'show_subject' => true,
                        'require_phone' => false,
                        'submit_label' => 'Send message',
                        'success_heading' => 'Jazak Allah khair — we got your message',
                        'success_message' => 'Our donor relations team replies within one business day, in shaa Allah.',
                        'contact_email' => 'hello@rahmahtrust.org',
                        'contact_phone' => '+92 21 0000 0000',
                    ],
                ],
                [
                    'type' => 'paragraph',
                    'settings' => [
                        'heading' => 'Visit us',
                        'body' => "Rahmah Trust Head Office\n14, Stadium Road, Karachi 75500, Pakistan\n\nOpening hours: Monday–Friday, 09:00–17:00 PKT\n\nFor walk-in donor visits, please call ahead so the relations team can welcome you properly.",
                        'max_width' => 'narrow',
                    ],
                ],
            ],
        ];
    }
}
