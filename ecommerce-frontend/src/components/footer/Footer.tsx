import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  const footerSections = [
    {
      title: 'Get to Know Us',
      links: ['About Us', 'Careers', 'Press Releases', 'ShopAI Cares']
    },
    {
      title: 'Connect with Us',
      links: ['Facebook', 'Twitter', 'Instagram', 'Youtube']
    },
    {
      title: 'Make Money with Us',
      links: ['Sell on ShopAI', 'Become an Affiliate', 'Advertise Your Products', 'Self-Publish with Us']
    },
    {
      title: 'Let Us Help You',
      links: ['Your Account', 'Returns Centre', 'Help', 'Customer Service']
    }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#232f3e] mt-12">
      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#37475a] hover:bg-[#485769] text-white py-3 text-sm font-medium transition-colors"
      >
        Back to top
      </button>

      {/* Main Footer Content */}
      <div className="bg-[#232f3e] text-white">
        <div className="max-w-[1500px] mx-auto px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {footerSections.map((section, index) => (
              <div key={index}>
                <h3 className="font-bold text-base mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href="#"
                        className="text-sm text-gray-300 hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('Navigate to:', link);
                        }}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-600 mt-10 pt-6">
            {/* Logo and Social Links */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">ShopAI</div>
              </div>

              {/* Social Icons */}
              <div className="flex gap-4">
                <a href="#" className="hover:text-gray-300 transition-colors" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-gray-300 transition-colors" aria-label="Twitter">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-gray-300 transition-colors" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-gray-300 transition-colors" aria-label="Youtube">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#131921] text-white">
        <div className="max-w-[1500px] mx-auto px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <a href="#" className="hover:underline">Conditions of Use</a>
              <a href="#" className="hover:underline">Privacy Notice</a>
              <a href="#" className="hover:underline">Your Ads Privacy Choices</a>
            </div>
            <div>
              © 2024-2026 ShopAI.com, Inc. or its affiliates
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}