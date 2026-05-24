<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PageResource\Pages;
use App\Models\Page;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PageResource extends Resource
{
    protected static ?string $model = Page::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationGroup = 'Tenants';

    protected static ?int $navigationSort = 20;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Page')
                ->columns(2)
                ->schema([
                    Forms\Components\Select::make('website_id')
                        ->relationship('website', 'site_name')
                        ->required()
                        ->searchable()
                        ->preload(),
                    Forms\Components\TextInput::make('slug')
                        ->required()
                        ->alphaDash()
                        ->maxLength(128),
                    Forms\Components\TextInput::make('title')->required()->maxLength(255),
                    Forms\Components\TextInput::make('sort_order')->required()->numeric()->default(0),
                    Forms\Components\Toggle::make('is_homepage'),
                    Forms\Components\Select::make('status')
                        ->options(['draft' => 'Draft', 'published' => 'Published'])
                        ->default('draft')
                        ->required(),
                ]),

            Forms\Components\Section::make('Content (sections)')
                ->collapsible()
                ->schema([
                    Forms\Components\Textarea::make('content_json')
                        ->required()
                        ->rows(20)
                        ->json()
                        ->autosize()
                        ->helperText('Structure: {sections:[{id,type,settings},…]}'),
                ]),

            Forms\Components\Section::make('SEO')
                ->collapsible()
                ->collapsed()
                ->schema([
                    Forms\Components\Textarea::make('seo_json')
                        ->rows(6)
                        ->json()
                        ->autosize()
                        ->helperText('Optional: {title, description, og_image}'),
                ]),

            Forms\Components\DateTimePicker::make('published_at'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('website_id')
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable()->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('website.site_name')->searchable()->label('Website'),
                Tables\Columns\TextColumn::make('slug')->searchable()->copyable(),
                Tables\Columns\TextColumn::make('title')->searchable()->weight('semibold'),
                Tables\Columns\IconColumn::make('is_homepage')->boolean()->label('Home'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state) => match ($state) {
                        'published' => 'success',
                        'draft' => 'warning',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('published_at')->dateTime()->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('updated_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['draft' => 'Draft', 'published' => 'Published']),
                Tables\Filters\SelectFilter::make('website')->relationship('website', 'site_name'),
                Tables\Filters\TernaryFilter::make('is_homepage'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPages::route('/'),
            'create' => Pages\CreatePage::route('/create'),
            'edit' => Pages\EditPage::route('/{record}/edit'),
        ];
    }
}
