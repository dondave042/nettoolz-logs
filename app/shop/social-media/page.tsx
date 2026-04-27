"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/currency"
import { toast } from "sonner"
import {
  Search,
  ShoppingCart,
  Star,
  Package,
  Loader2,
  ChevronDown,
  Filter,
} from "lucide-react"

const SOCIAL_MEDIA_CATEGORIES = [
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "TWITTER",
  "SNAPCHAT",
  "YOUTUBE",
  "TELEGRAM",
  "LINKEDIN",
  "WHATSAPP",
  // Legacy combined category, kept for backward compatibility
  "FACEBOOK INSTAGRAM",
]

interface Product {
  id: number
  sku: string
  name: string
  description: string
  price: string
  available_qty: number
  badge?: string
  is_featured: boolean
  category_name: string
  images?: string[]
}

const PLATFORM_ICONS: Record<string, string> = {
  FACEBOOK: "📘",
  INSTAGRAM: "📸",
  TIKTOK: "🎵",
  TWITTER: "🐦",
  SNAPCHAT: "👻",
  YOUTUBE: "▶️",
  TELEGRAM: "✈️",
  LINKEDIN: "💼",
  WHATSAPP: "💬",
  "FACEBOOK INSTAGRAM": "📱",
}

export default function SocialMediaMarketPage() {
  const router = useRouter()
  const { addItem } = useCart()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activePlatform, setActivePlatform] = useState<string | null>(null)
  const [addingId, setAddingId] = useState<number | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/products")
        if (!res.ok) throw new Error("Failed to load products")
        const data = await res.json()
        const list: Product[] = Array.isArray(data) ? data : data.products ?? []
        const socialProducts = list.filter((p) =>
          SOCIAL_MEDIA_CATEGORIES.includes(
            (p.category_name ?? "").toUpperCase().trim()
          )
        )
        setAllProducts(socialProducts)
      } catch {
        toast.error("Failed to load products. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Platforms present in the current product list
  const availablePlatforms = useMemo(
    () =>
      Array.from(
        new Set(allProducts.map((p) => p.category_name.toUpperCase().trim()))
      ).filter((cat) => SOCIAL_MEDIA_CATEGORIES.includes(cat)),
    [allProducts]
  )

  const filtered = useMemo(() => {
    let result = allProducts
    if (activePlatform) {
      result = result.filter(
        (p) => p.category_name.toUpperCase().trim() === activePlatform
      )
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
      )
    }
    return result
  }, [allProducts, activePlatform, search])

  const handleAddToCart = async (product: Product) => {
    setAddingId(product.id)
    try {
      const res = await fetch("/api/buyers/me")
      if (!res.ok) {
        toast.error("Please sign in to add items to cart")
        router.push("/login")
        return
      }
      addItem({
        productId: product.id,
        productName: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        image: product.images?.[0] || null,
      })
      toast.success(`${product.name} added to cart!`)
    } catch {
      toast.error("Failed to add to cart")
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="border-b border-border bg-gradient-to-br from-[#0c4a6e] to-[#0c1e2d] px-4 py-12 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="mb-3 flex items-center justify-center gap-2 text-2xl">
              📘📸🎵🐦👻▶️
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Social Media Market
            </h1>
            <p className="mt-3 text-[#7dd3fc]">
              Premium verified accounts for every major social platform. Instant
              delivery after purchase.
            </p>
          </div>
        </section>

        {/* Platform Quick Filters */}
        {availablePlatforms.length > 0 && (
          <section className="border-b border-border bg-card">
            <div className="mx-auto max-w-7xl overflow-x-auto px-4 py-4 lg:px-8">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActivePlatform(null)}
                  className={`flex-shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    activePlatform === null
                      ? "border-[#38bdf8] bg-[#38bdf8]/10 text-[#0284c7]"
                      : "border-border text-muted-foreground hover:border-[#38bdf8]/50 hover:text-foreground"
                  }`}
                >
                  All Platforms
                </button>
                {availablePlatforms.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => setActivePlatform(platform)}
                    className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      activePlatform === platform
                        ? "border-[#38bdf8] bg-[#38bdf8]/10 text-[#0284c7]"
                        : "border-border text-muted-foreground hover:border-[#38bdf8]/50 hover:text-foreground"
                    }`}
                  >
                    <span>{PLATFORM_ICONS[platform] ?? "📱"}</span>
                    <span>
                      {platform.charAt(0) + platform.slice(1).toLowerCase()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          {/* Search + Filter Bar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search social media products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Mobile platform filter dropdown */}
            <div className="relative flex items-center gap-1.5 sm:hidden">
              <Filter className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setFilterOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <span>
                  {activePlatform
                    ? activePlatform.charAt(0) +
                      activePlatform.slice(1).toLowerCase()
                    : "All Platforms"}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${filterOpen ? "rotate-180" : ""}`}
                />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 min-w-52 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePlatform(null)
                      setFilterOpen(false)
                    }}
                    className={`block w-full px-4 py-3 text-left text-sm transition-colors ${
                      activePlatform === null
                        ? "bg-[#38bdf8]/10 text-[#0284c7]"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    All Platforms
                  </button>
                  {availablePlatforms.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => {
                        setActivePlatform(platform)
                        setFilterOpen(false)
                      }}
                      className={`block w-full px-4 py-3 text-left text-sm transition-colors ${
                        activePlatform === platform
                          ? "bg-[#38bdf8]/10 text-[#0284c7]"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      {PLATFORM_ICONS[platform] ?? "📱"}{" "}
                      {platform.charAt(0) + platform.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product List */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-[#38bdf8]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card py-20 text-center">
              <Package className="h-12 w-12 text-muted-foreground/40" />
              <div>
                <p className="font-semibold text-foreground">
                  No products found
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search
                    ? `No results for "${search}". Try a different search.`
                    : activePlatform
                      ? `No products available for ${activePlatform.charAt(0) + activePlatform.slice(1).toLowerCase()} yet. Check back soon!`
                      : "No social media products are available right now. Check back soon!"}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("")
                  setActivePlatform(null)
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""}{" "}
                found
              </p>
              <div className="space-y-5">
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-[#38bdf8]/50 hover:shadow-md"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative md:w-72 md:flex-shrink-0">
                        <div className="flex h-56 items-center justify-center bg-gradient-to-br from-[#0c4a6e]/30 to-[#075985]/30 md:h-full">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-6xl">
                              {PLATFORM_ICONS[
                                product.category_name.toUpperCase().trim()
                              ] ?? "📱"}
                            </span>
                          )}
                        </div>

                        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                          {product.is_featured && (
                            <div className="inline-flex items-center rounded-full bg-amber-500/90 px-2.5 py-1 text-[10px] font-medium text-white">
                              <Star className="mr-1 h-2.5 w-2.5" />
                              Featured
                            </div>
                          )}
                          {product.badge && (
                            <div className="rounded-full bg-[#38bdf8] px-2.5 py-1 text-[10px] font-medium text-white">
                              {product.badge}
                            </div>
                          )}
                          {product.available_qty === 0 && (
                            <div className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-medium text-white">
                              Out of stock
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-between gap-5 p-5 md:flex-row md:items-start md:p-6">
                        <div className="min-w-0 flex-1 space-y-3">
                          <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#38bdf8]">
                            {PLATFORM_ICONS[
                              product.category_name.toUpperCase().trim()
                            ] ?? "📱"}{" "}
                            {product.category_name}
                          </span>
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-foreground">
                              {product.name}
                            </h3>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                              {product.description}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="text-2xl font-bold text-foreground">
                              {formatPrice(parseFloat(product.price))}
                            </span>
                            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                              {product.available_qty > 0
                                ? `${product.available_qty} in stock`
                                : "Out of stock"}
                            </span>
                          </div>
                        </div>

                        <div className="flex w-full flex-col gap-3 md:w-44 md:flex-shrink-0">
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            disabled={
                              product.available_qty === 0 ||
                              addingId === product.id
                            }
                            className="w-full gap-1.5 bg-[#38bdf8] text-white hover:bg-[#0ea5e9] disabled:opacity-50"
                          >
                            {addingId === product.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ShoppingCart className="h-3.5 w-3.5" />
                            )}
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
