<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Hash;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationGroup = 'People';

    protected static ?int $navigationSort = 10;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Account')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('name')->required()->maxLength(255),
                    Forms\Components\TextInput::make('email')->email()->required()->unique(ignoreRecord: true)->maxLength(255),
                    Forms\Components\TextInput::make('password')
                        ->password()
                        ->revealable()
                        ->dehydrateStateUsing(fn ($state) => filled($state) ? Hash::make($state) : null)
                        ->dehydrated(fn ($state) => filled($state))
                        ->required(fn (string $context) => $context === 'create')
                        ->helperText('Leave blank to keep current.')
                        ->maxLength(255),
                    Forms\Components\DateTimePicker::make('email_verified_at'),
                ]),

            Forms\Components\Section::make('Organisation')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('organization_name')->maxLength(255),
                    Forms\Components\TextInput::make('site_name')->maxLength(255),
                    Forms\Components\TextInput::make('phone')->tel()->maxLength(32),
                    Forms\Components\TextInput::make('country')->maxLength(64),
                ]),

            Forms\Components\Section::make('Onboarding state')
                ->collapsible()
                ->collapsed()
                ->columns(2)
                ->schema([
                    Forms\Components\Select::make('website_type')
                        ->options(['welfare' => 'Welfare', 'scholar' => 'Scholar']),
                    Forms\Components\TextInput::make('selected_theme_id')->maxLength(64),
                    Forms\Components\TextInput::make('brand_color')->maxLength(32),
                    Forms\Components\TextInput::make('accent_color')->maxLength(32),
                    Forms\Components\TextInput::make('background_tone')->maxLength(32),
                    Forms\Components\Select::make('typography_style')
                        ->options([
                            'modern' => 'Modern',
                            'classical' => 'Classical',
                            'minimal' => 'Minimal',
                            'editorial' => 'Editorial',
                            'display' => 'Display',
                        ]),
                    Forms\Components\TagsInput::make('site_languages')->suggestions(['en', 'ar']),
                    Forms\Components\TextInput::make('tagline')->maxLength(255),
                    Forms\Components\TextInput::make('logo_path')->maxLength(255),
                    Forms\Components\TextInput::make('favicon_path')->maxLength(255),
                    Forms\Components\Toggle::make('donations_enabled'),
                    Forms\Components\DateTimePicker::make('onboarding_completed_at'),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable()->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('name')->searchable()->weight('semibold'),
                Tables\Columns\TextColumn::make('email')->searchable()->copyable(),
                Tables\Columns\TextColumn::make('organization_name')->searchable()->toggleable(),
                Tables\Columns\TextColumn::make('website_type')->badge()->toggleable(),
                Tables\Columns\IconColumn::make('email_verified_at')
                    ->label('Verified')
                    ->boolean()
                    ->getStateUsing(fn ($record) => $record->email_verified_at !== null),
                Tables\Columns\IconColumn::make('onboarding_completed_at')
                    ->label('Onboarded')
                    ->boolean()
                    ->getStateUsing(fn ($record) => $record->onboarding_completed_at !== null),
                Tables\Columns\TextColumn::make('country')->toggleable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()->toggleable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('website_type')
                    ->options(['welfare' => 'Welfare', 'scholar' => 'Scholar']),
                Tables\Filters\Filter::make('verified')
                    ->query(fn ($query) => $query->whereNotNull('email_verified_at')),
                Tables\Filters\Filter::make('onboarded')
                    ->query(fn ($query) => $query->whereNotNull('onboarding_completed_at')),
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
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
