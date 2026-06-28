import json
import os
from pathlib import Path
from django.core.management.base import BaseCommand
from api.models import Preset

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent


class Command(BaseCommand):
    help = 'Seed presets into the database'

    def handle(self, *args, **options):
        presets_json = BASE_DIR / 'presets.json'
        if presets_json.exists():
            with open(presets_json, encoding='utf-8') as f:
                all_presets = json.load(f)
        else:
            try:
                import butterchurnPresets
                all_presets = butterchurnPresets.getPresets()
            except ImportError:
                self.stdout.write('butterchurnPresets not available. Frontend will use JS library directly.')
                return

        count = 0
        for name, data in all_presets.items():
            _, created = Preset.objects.get_or_create(
                name=name,
                defaults={
                    'category': '',
                    'json_data': data,
                }
            )
            if created:
                count += 1

        self.stdout.write(self.style.SUCCESS(f'Seeded {count} presets (total: {Preset.objects.count()})'))
