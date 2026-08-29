from django.core.management.base import BaseCommand
from catalog.models import SiteSettings

class Command(BaseCommand):
    help = 'Updates SiteSettings branding to RONAK'

    def handle(self, *args, **options):
        s = SiteSettings.objects.first()
        if not s:
            s = SiteSettings.objects.create(
                site_name='RONAK',
                custom_logo_text='RONAK',
                top_welcome_text='Welcome to RONAK — House of Premium Brands',
                phone_display='1-800-RONAK',
                email='support@ronak.pk',
                address='Ronak Luxury HQ, Lahore, Pakistan',
                home_hero_subtitle='Experience Velora skincare, Elan luxury apparel, and Stryde athletic footwear under Ronak’s unified multi-brand house.',
                site_description='Ronak is a premier luxury collective bringing together three distinct worlds of cosmetics, fashion, and athletic footwear under one standard of elegance.'
            )
            self.stdout.write(self.style.SUCCESS('Created SiteSettings with RONAK branding.'))
        else:
            s.site_name = 'RONAK'
            s.custom_logo_text = 'RONAK'
            s.top_welcome_text = 'Welcome to RONAK — House of Premium Brands'
            s.phone_display = '1-800-RONAK'
            s.email = 'support@ronak.pk'
            s.address = 'Ronak Luxury HQ, Lahore, Pakistan'
            s.home_hero_subtitle = 'Experience Velora skincare, Elan luxury apparel, and Stryde athletic footwear under Ronak’s unified multi-brand house.'
            s.site_description = 'Ronak is a premier luxury collective bringing together three distinct worlds of cosmetics, fashion, and athletic footwear under one standard of elegance.'
            s.save()
            self.stdout.write(self.style.SUCCESS('Updated existing SiteSettings with RONAK branding.'))
