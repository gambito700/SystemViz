from django.http import JsonResponse
from django.views.decorators.http import require_GET
from .models import Preset

@require_GET
def preset_list(request):
    presets = Preset.objects.all().values('id', 'name', 'category')
    return JsonResponse(list(presets), safe=False)


@require_GET
def preset_detail(request, name):
    try:
        preset = Preset.objects.get(name=name)
        return JsonResponse({'id': preset.id, 'name': preset.name, 'category': preset.category, 'json_data': preset.json_data})
    except Preset.DoesNotExist:
        return JsonResponse({'error': 'Preset not found'}, status=404)
