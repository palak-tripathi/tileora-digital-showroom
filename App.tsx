import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HeroSection } from './components/home/HeroSection';
import { CollectionsBento } from './components/home/CollectionsBento';
import { FeaturedProducts } from './components/home/FeaturedProducts';
import { SmartDiscoverySection } from './components/home/SmartDiscoverySection';
import { WhyChooseUs } from './components/home/WhyChooseUs';
import { CustomerReviews } from './components/home/CustomerReviews';
import { WhoWeServe } from './components/home/WhoWeServe';
import { MarketingStorySection } from './components/home/MarketingStorySection';
import { ProductCatalogue } from './components/catalogue/ProductCatalogue';
import { ProductDetailModal } from './components/catalogue/ProductDetailModal';
import { RoomRecommender } from './components/tools/RoomRecommender';
import { ProductComparison } from './components/tools/ProductComparison';
import { QuoteModal } from './components/enquiry/QuoteModal';
import { AboutUsView } from './components/about/AboutUsView';
import { ContactView } from './components/contact/ContactView';
import { MarketingStrategyView } from './components/marketing/MarketingStrategyView';
import { OffersView } from './components/offers/OffersView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SearchModal } from './components/common/SearchModal';
import { CustomerJourneySection } from './components/home/CustomerJourneySection';
import { AICalculatorRecommender } from './components/tools/AICalculatorRecommender';
import { INITIAL_TILES } from './data/mockTiles';
import { TileProduct, TileCategory, CustomerType, QuoteEnquiry } from './types';
import { Scale, ArrowRight, MessageSquare, Calculator, Sparkles } from 'lucide-react';
import { CurrencyProvider, useCurrency } from './context/CurrencyContext';

function AppContent() {
  const { formatPrice, currency } = useCurrency();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [products, setProducts] = useState<TileProduct[]>(INITIAL_TILES);
  const [comparedTiles, setComparedTiles] = useState<TileProduct[]>([]);
  const [selectedProductForModal, setSelectedProductForModal] = useState<TileProduct | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteTargetProduct, setQuoteTargetProduct] = useState<TileProduct | undefined>(undefined);
  const [quoteTargetCustomerType, setQuoteTargetCustomerType] = useState<CustomerType>('Homeowner');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [selectedCatalogueCategory, setSelectedCatalogueCategory] = useState<TileCategory | 'all'>('all');

  // Handle category click from Home collections
  const handleSelectCategory = (category: TileCategory) => {
    setSelectedCatalogueCategory(category);
    setCurrentTab('tiles');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Compare
  const handleToggleCompare = (tile: TileProduct) => {
    setComparedTiles((prev) => {
      const exists = prev.some((p) => p.id === tile.id);
      if (exists) {
        return prev.filter((p) => p.id !== tile.id);
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 tiles simultaneously.');
        return prev;
      }
      return [...prev, tile];
    });
  };

  const handleOpenQuote = (product?: TileProduct, customerType?: CustomerType) => {
    setQuoteTargetProduct(product);
    if (customerType) setQuoteTargetCustomerType(customerType);
    setIsQuoteModalOpen(true);
  };

  const handleOpenWhatsApp = (product?: TileProduct) => {
    const text = encodeURIComponent(
      product
        ? `Hello TILEORA Architectural Team! I would like to enquire about ${product.name} (${product.dimensionsMm.width}x${product.dimensionsMm.length}mm, ${product.finish} finish) at ${formatPrice(product.pricePerSqm)}/m² (Base: ₹${product.pricePerSqm.toLocaleString('en-IN')}).`
        : 'Hello TILEORA Showroom! I would like to enquire about your architectural porcelain and stone collections.'
    );
    window.open(`https://wa.me/917440608049?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1C1C1E]">
      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenQuoteModal={() => handleOpenQuote()}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        comparedTiles={comparedTiles}
        onOpenCompare={() => setIsCompareModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <>
            <HeroSection
              featuredTile={products[0]}
              onExploreCollections={() => {
                setCurrentTab('collections');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenQuote={() => handleOpenQuote()}
            />

            <CollectionsBento onSelectCategory={handleSelectCategory} />

            <FeaturedProducts
              products={products}
              onViewDetails={(tile) => setSelectedProductForModal(tile)}
              onOpenQuote={(tile) => handleOpenQuote(tile)}
              onToggleCompare={handleToggleCompare}
              comparedIds={comparedTiles.map((t) => t.id)}
              onViewAll={() => {
                setSelectedCatalogueCategory('all');
                setCurrentTab('tiles');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            <SmartDiscoverySection
              tiles={products}
              onViewTile={(tile) => setSelectedProductForModal(tile)}
              onOpenFullRecommender={() => {
                setCurrentTab('recommender');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* AI Calculator Feature Section on Home */}
            <section className="py-16 bg-[#18181B] text-white border-b border-[#27272A]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#C2A87E] uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-[#C2A87E]" />
                      <span>Architectural AI Intelligence</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-serif text-white">
                      AI Recommendations & Wastage Calculator
                    </h2>
                    <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                      Prevent mid-installation shortages and inaccurate budgeting. Our AI quantity surveyor calculates exact cutting buffers (+10% straight to +18% herringbone/chevron), specifies 1.5mm rectified joint spacers, and delivers tailored ceramic recommendations.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={() => {
                        setCurrentTab('ai-calc');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-6 py-3.5 text-xs font-semibold tracking-wider text-black bg-[#C2A87E] hover:bg-[#D4BC94] rounded-md transition-colors uppercase flex items-center gap-2 shadow-sm"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>Launch AI Calculator</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <WhyChooseUs />

            <CustomerReviews />

            <CustomerJourneySection
              onExploreTiles={() => {
                setSelectedCatalogueCategory('all');
                setCurrentTab('tiles');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenCompare={() => setIsCompareModalOpen(true)}
              onOpenQuote={() => handleOpenQuote()}
              onOpenContact={() => {
                setCurrentTab('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            <WhoWeServe
              onOpenQuoteWithCustomerType={(type) => handleOpenQuote(undefined, type)}
            />

            <MarketingStorySection
              onExploreMarketingStrategy={() => {
                setCurrentTab('marketing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        )}

        {currentTab === 'journey' && (
          <div className="py-8 bg-white min-h-screen">
            <CustomerJourneySection
              onExploreTiles={() => {
                setSelectedCatalogueCategory('all');
                setCurrentTab('tiles');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenCompare={() => setIsCompareModalOpen(true)}
              onOpenQuote={() => handleOpenQuote()}
              onOpenContact={() => {
                setCurrentTab('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {currentTab === 'collections' && (
          <div className="py-12 bg-[#FAF9F6]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <div className="text-xs font-semibold tracking-[0.2em] text-[#A68856] uppercase mb-1">
                  Architectural Portfolios
                </div>
                <h1 className="text-3xl sm:text-4xl font-serif text-[#1A1A1A]">
                  Curated Tile Collections
                </h1>
                <p className="text-sm text-[#666] mt-2">
                  Select a tailored ceramic line to explore technical specs, slip ratings, and box coverage.
                </p>
              </div>
              <CollectionsBento onSelectCategory={handleSelectCategory} />
            </div>
          </div>
        )}

        {currentTab === 'tiles' && (
          <ProductCatalogue
            products={products}
            initialCategory={selectedCatalogueCategory}
            onViewProduct={(tile) => setSelectedProductForModal(tile)}
            onOpenQuote={(tile) => handleOpenQuote(tile)}
            onToggleCompare={handleToggleCompare}
            comparedIds={comparedTiles.map((t) => t.id)}
          />
        )}

        {currentTab === 'recommender' && (
          <RoomRecommender
            products={products}
            onViewProduct={(tile) => setSelectedProductForModal(tile)}
            onOpenQuote={(tile) => handleOpenQuote(tile)}
          />
        )}

        {currentTab === 'ai-calc' && (
          <AICalculatorRecommender
            products={products}
            onViewProduct={(tile) => setSelectedProductForModal(tile)}
            onOpenQuote={(tile) => handleOpenQuote(tile)}
            onOpenWhatsApp={() => handleOpenWhatsApp()}
          />
        )}

        {currentTab === 'offers' && (
          <OffersView
            onOpenQuote={(pkg) =>
              handleOpenQuote(undefined, pkg?.type)
            }
          />
        )}

        {currentTab === 'marketing' && <MarketingStrategyView />}

        {currentTab === 'about' && (
          <AboutUsView
            onOpenQuote={() => handleOpenQuote()}
            onExploreTiles={() => {
              setCurrentTab('tiles');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'contact' && (
          <ContactView onOpenWhatsApp={() => handleOpenWhatsApp()} />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            products={products}
            onRefreshProducts={() => {
              // Reload initial tiles + any session tiles
            }}
          />
        )}
      </main>

      {/* Floating Bottom Compare Tray (Visible if items are compared) */}
      {comparedTiles.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 bg-[#1A1A1A] text-white p-3 rounded-xl shadow-2xl border border-[#333] flex items-center gap-3 text-xs animate-in slide-in-from-bottom-2">
          <Scale className="w-4 h-4 text-[#C2A87E]" />
          <span>
            <strong>{comparedTiles.length}</strong> surface{comparedTiles.length > 1 ? 's' : ''} in comparison tray
          </span>
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="px-3 py-1.5 bg-[#C2A87E] text-black font-semibold rounded-md hover:bg-[#D4BC94] transition-colors uppercase text-[11px]"
          >
            Compare Now
          </button>
        </div>
      )}

      {/* Floating WhatsApp Action */}
      <button
        onClick={() => handleOpenWhatsApp()}
        className="fixed bottom-4 left-4 z-40 p-3 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#1EBE5D] hover:scale-105 transition-all flex items-center justify-center"
        title="Chat with TILEORA on WhatsApp"
        aria-label="WhatsApp Showroom Support"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Modals */}
      <ProductDetailModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onOpenQuote={(tile) => {
          setSelectedProductForModal(null);
          handleOpenQuote(tile);
        }}
        onOpenWhatsApp={(tile) => handleOpenWhatsApp(tile)}
        onToggleCompare={handleToggleCompare}
        isCompared={selectedProductForModal ? comparedTiles.some((t) => t.id === selectedProductForModal.id) : false}
      />

      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        initialProduct={quoteTargetProduct}
        initialCustomerType={quoteTargetCustomerType}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        products={products}
        onSelectProduct={(tile) => setSelectedProductForModal(tile)}
      />

      {isCompareModalOpen && (
        <ProductComparison
          comparedTiles={comparedTiles}
          onRemoveFromCompare={(id) => setComparedTiles((prev) => prev.filter((p) => p.id !== id))}
          onClearAll={() => setComparedTiles([])}
          onOpenQuote={(tile) => {
            setIsCompareModalOpen(false);
            handleOpenQuote(tile);
          }}
          onClose={() => setIsCompareModalOpen(false)}
          onBrowseCatalogue={() => {
            setIsCompareModalOpen(false);
            setCurrentTab('tiles');
          }}
        />
      )}

      {/* Footer */}
      <Footer
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenQuote={() => handleOpenQuote()}
        onOpenWhatsApp={() => handleOpenWhatsApp()}
      />
    </div>
  );
}

export default function App() {
  return (
    <CurrencyProvider>
      <AppContent />
    </CurrencyProvider>
  );
}
