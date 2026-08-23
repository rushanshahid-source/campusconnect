import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ChevronLeft, Heart, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { PLACEHOLDER_IMAGE, onImageError } from "@/lib/imageFallback";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type EditableItem = {
  id: number; title: string; description: string; price: string;
  priceType: "per_day" | "per_week" | "per_month" | "fixed";
  category: "electronics" | "books" | "tools" | "furniture" | "sports" | "fashion" | "notes" | "projects" | "other";
  type: "rental" | "sale"; image: string; condition: "new" | "like_new" | "good" | "fair" | "poor";
  securityDeposit: string; tags: string; isAvailable: boolean;
};

const categories = [
  { id: "all", label: "All" },
  { id: "electronics", label: "Electronics" },
  { id: "books", label: "Books" },
  { id: "tools", label: "Tools" },
  { id: "notes", label: "Notes" },
  { id: "fashion", label: "Fashion" },
  { id: "sports", label: "Sports" },
];

const tabs = [
  { id: "all", label: "All Items" },
  { id: "rental", label: "Rentals" },
  { id: "sale", label: "For Sale" },
];

export default function Market() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const deleteItem = trpc.admin.deleteContent.useMutation({
    onSuccess: () => {
      void utils.items.list.invalidate();
      void utils.items.trending.invalidate();
    },
  });
  const saveItem = trpc.admin.updateItem.useMutation({
    onSuccess: () => {
      setEditingItem(null);
      void utils.items.list.invalidate();
      void utils.items.trending.invalidate();
    },
  });

  const startEditing = (item: NonNullable<typeof items>[number]) => setEditingItem({
    id: item.id, title: item.title, description: item.description ?? "", price: item.price,
    priceType: item.priceType, category: item.category, type: item.type, image: item.image ?? "",
    condition: item.condition ?? "good", securityDeposit: item.securityDeposit ?? "0.00",
    tags: item.tags ?? "", isAvailable: item.isAvailable ?? true,
  });

  const { data: items } = trpc.items.list.useQuery({
    category: activeCategory === "all" ? undefined : activeCategory,
    type: activeTab === "all" ? undefined : (activeTab as "rental" | "sale"),
    search: search || undefined,
    limit: 50,
  });

  return (
    <AppLayout>
      <div className="px-4 pt-4 pb-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 bg-[#1A1F2E] rounded-xl border border-white/5"
          >
            <ChevronLeft size={20} className="text-gray-400" />
          </button>
          <h1 className="text-xl font-bold">Campus Market</h1>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search items, notes, gear..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#1A1F2E] border-white/10 text-white placeholder:text-gray-600 h-11"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2">
            <Filter size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Type Tabs */}
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[#6366F1] text-white"
                  : "bg-[#1A1F2E] text-gray-400 border border-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-[#10B981] text-white"
                  : "bg-[#1A1F2E] text-gray-400 border border-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 gap-3"
        >
          <AnimatePresence>
            {items?.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(`/market/${item.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => { if (event.key === "Enter") navigate(`/market/${item.id}`); }}
                className="bg-[#1A1F2E] rounded-2xl overflow-hidden border border-white/5 text-left cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={item.image || PLACEHOLDER_IMAGE}
                    onError={onImageError}
                    alt={item.title}
                    className="w-full h-32 object-cover"
                  />
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-sm rounded-full"
                  >
                    <Heart size={14} className="text-white" />
                  </button>
                  {isAdmin && (
                    <div className="absolute top-2 left-2 flex gap-1">
                      <button
                        title="Edit marketplace post"
                        onClick={(event) => {
                          event.stopPropagation();
                          startEditing(item);
                        }}
                        className="p-1.5 rounded-md bg-black/60 text-white hover:bg-[#6366F1]"
                      ><Pencil size={13} /></button>
                      <button
                        title="Delete marketplace post"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (window.confirm(`Delete \"${item.title}\" permanently?`)) {
                            deleteItem.mutate({ type: "item", id: item.id, reason: "Removed by administrator" });
                          }
                        }}
                        className="p-1.5 rounded-md bg-black/60 text-white hover:bg-red-500"
                      ><Trash2 size={13} /></button>
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#6366F1] text-[10px] font-medium rounded-full">
                    {item.type === "rental" ? "Rent" : "Buy"}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium truncate">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold text-[#10B981]">
                      Rs. {item.price}
                    </span>
                    <span className="text-[10px] text-gray-500 capitalize">
                      {item.priceType.replace("_", " ")}
                    </span>
                  </div>
                  {item.securityDeposit && Number(item.securityDeposit) > 0 && (
                    <p className="text-[10px] text-gray-600 mt-1">
                      Deposit: Rs. {item.securityDeposit}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {items?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No items found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>
      <Dialog open={!!editingItem} onOpenChange={(open) => { if (!open) setEditingItem(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-[#151B2A] border-white/10 text-white">
          <DialogHeader><DialogTitle>Edit marketplace post</DialogTitle><DialogDescription className="text-gray-400">Update the complete listing record as administrator.</DialogDescription></DialogHeader>
          {editingItem && <div className="grid gap-4 py-2">
            <label className="grid gap-1.5 text-xs text-gray-400">Title<input value={editingItem.title} onChange={(event) => setEditingItem({ ...editingItem, title: event.target.value })} className="h-10 rounded-md border border-white/10 bg-[#0B0F1A] px-3 text-sm text-white" /></label>
            <label className="grid gap-1.5 text-xs text-gray-400">Description<textarea value={editingItem.description} onChange={(event) => setEditingItem({ ...editingItem, description: event.target.value })} rows={4} className="rounded-md border border-white/10 bg-[#0B0F1A] px-3 py-2 text-sm text-white" /></label>
            <div className="grid grid-cols-2 gap-3"><label className="grid gap-1.5 text-xs text-gray-400">Price<input value={editingItem.price} onChange={(event) => setEditingItem({ ...editingItem, price: event.target.value })} className="h-10 rounded-md border border-white/10 bg-[#0B0F1A] px-3 text-sm text-white" /></label><label className="grid gap-1.5 text-xs text-gray-400">Deposit<input value={editingItem.securityDeposit} onChange={(event) => setEditingItem({ ...editingItem, securityDeposit: event.target.value })} className="h-10 rounded-md border border-white/10 bg-[#0B0F1A] px-3 text-sm text-white" /></label></div>
            <div className="grid grid-cols-2 gap-3"><label className="grid gap-1.5 text-xs text-gray-400">Listing type<select value={editingItem.type} onChange={(event) => setEditingItem({ ...editingItem, type: event.target.value as EditableItem["type"] })} className="h-10 rounded-md border border-white/10 bg-[#0B0F1A] px-2 text-sm text-white"><option value="rental">Rental</option><option value="sale">Sale</option></select></label><label className="grid gap-1.5 text-xs text-gray-400">Price period<select value={editingItem.priceType} onChange={(event) => setEditingItem({ ...editingItem, priceType: event.target.value as EditableItem["priceType"] })} className="h-10 rounded-md border border-white/10 bg-[#0B0F1A] px-2 text-sm text-white"><option value="fixed">Fixed</option><option value="per_day">Per day</option><option value="per_week">Per week</option><option value="per_month">Per month</option></select></label></div>
            <div className="grid grid-cols-2 gap-3"><label className="grid gap-1.5 text-xs text-gray-400">Category<select value={editingItem.category} onChange={(event) => setEditingItem({ ...editingItem, category: event.target.value as EditableItem["category"] })} className="h-10 rounded-md border border-white/10 bg-[#0B0F1A] px-2 text-sm text-white">{["electronics", "books", "tools", "furniture", "sports", "fashion", "notes", "projects", "other"].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label className="grid gap-1.5 text-xs text-gray-400">Condition<select value={editingItem.condition} onChange={(event) => setEditingItem({ ...editingItem, condition: event.target.value as EditableItem["condition"] })} className="h-10 rounded-md border border-white/10 bg-[#0B0F1A] px-2 text-sm text-white">{["new", "like_new", "good", "fair", "poor"].map((value) => <option key={value} value={value}>{value.replace("_", " ")}</option>)}</select></label></div>
            <label className="grid gap-1.5 text-xs text-gray-400">Image URL<input value={editingItem.image} onChange={(event) => setEditingItem({ ...editingItem, image: event.target.value })} className="h-10 rounded-md border border-white/10 bg-[#0B0F1A] px-3 text-sm text-white" /></label>
            <label className="grid gap-1.5 text-xs text-gray-400">Tags <span className="text-[10px] text-gray-600">Comma separated</span><input value={editingItem.tags} onChange={(event) => setEditingItem({ ...editingItem, tags: event.target.value })} className="h-10 rounded-md border border-white/10 bg-[#0B0F1A] px-3 text-sm text-white" /></label>
            <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={editingItem.isAvailable} onChange={(event) => setEditingItem({ ...editingItem, isAvailable: event.target.checked })} /> Available to students</label>
          </div>}
          <DialogFooter><button onClick={() => setEditingItem(null)} className="rounded-md border border-white/10 px-4 py-2 text-sm text-gray-300">Cancel</button><button disabled={!editingItem?.title.trim() || saveItem.isPending} onClick={() => editingItem && saveItem.mutate(editingItem)} className="rounded-md bg-[#6366F1] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saveItem.isPending ? "Saving..." : "Save changes"}</button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
