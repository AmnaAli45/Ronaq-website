from django.core.management.base import BaseCommand
from catalog.models import SiteSettings, Product, ProductVariant

class Command(BaseCommand):
    help = 'Updates SiteSettings branding to RONAK and applies promotional settings'

    def handle(self, *args, **options):
        s = SiteSettings.objects.first()
        if not s:
            s = SiteSettings.objects.create(
                site_name='RONAK',
                logo_url='/logo.png',
                custom_logo_text='RONAK',
                top_welcome_text='Welcome to RONAK — House of Premium Brands',
                phone_display='1-800-RONAK',
                email='support@ronak.pk',
                address='Ronak Luxury HQ, Lahore, Pakistan',
                home_hero_subtitle='Experience Velora skincare, Elan luxury apparel, and Stryde athletic footwear under Ronak’s unified multi-brand house.',
                site_description='Ronak is a premier luxury collective bringing together three distinct worlds of cosmetics, fashion, and athletic footwear under one standard of elegance.',
                announcement_enabled=False
            )
            self.stdout.write(self.style.SUCCESS('Created SiteSettings with RONAK branding.'))
        else:
            s.site_name = 'RONAK'
            s.logo_url = '/logo.png'
            s.custom_logo_text = 'RONAK'
            s.top_welcome_text = 'Welcome to RONAK — House of Premium Brands'
            s.phone_display = '1-800-RONAK'
            s.email = 'support@ronak.pk'
            s.address = 'Ronak Luxury HQ, Lahore, Pakistan'
            s.home_hero_subtitle = 'Experience Velora skincare, Elan luxury apparel, and Stryde athletic footwear under Ronak’s unified multi-brand house.'
            s.site_description = 'Ronak is a premier luxury collective bringing together three distinct worlds of cosmetics, fashion, and athletic footwear under one standard of elegance.'
            s.announcement_enabled = False
            s.save()
            self.stdout.write(self.style.SUCCESS('Updated existing SiteSettings with RONAK branding.'))

        Product.objects.all().update(base_price=0, discount_price=0, discount_badge='100% FREE')
        ProductVariant.objects.all().update(price_override=0)
        self.stdout.write(self.style.SUCCESS('Updated all products to Rs. 0 in database.'))
