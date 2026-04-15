import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavBar } from "../components/NavBar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Tabs } from "../components/Tabs";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { listProducts, createProduct, deleteProduct } from "../api/products";
import { HttpError } from "../api/client";
import { useToast } from "../hooks/useToast";

const CATEGORIES = ["Fungicide", "Insecticide", "Herbicide", "Fertilizer", "Other"];

const PRODUCT_TABS = [
  { id: "add", label: "Add product", panelId: "products-tab-add" },
  { id: "library", label: "Library", panelId: "products-tab-library" },
];

const selectClass =
  "block w-full rounded-lg border border-slate-600 bg-slate-800 px-3 h-10 text-sm text-slate-100 " +
  "transition-colors duration-150 " +
  "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500 focus:border-emerald-500";

export default function Products() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("add");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [filterCategory, setFilterCategory] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setName("");
      setFormError(null);
      addToast("Product added");
    },
    onError: (err) => {
      if (err instanceof HttpError) {
        setFormError(err.body.error ?? "Failed to add product");
      } else {
        setFormError("Network error");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      addToast("Product removed");
    },
    onError: (err) => {
      if (err instanceof HttpError) {
        setFormError(err.body.error ?? "Failed to remove product");
      } else {
        setFormError("Network error");
      }
    },
  });

  const handleCreate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    createMutation.mutate({ name: name.trim(), category });
  };

  const products = productsQuery.data ?? [];
  const filtered = filterCategory
    ? products.filter((p) => p.category === filterCategory)
    : products;

  return (
    <div data-testid="products-page" className="min-h-screen bg-slate-950">
      {pendingDeleteId && (
        <ConfirmDialog
          message="Remove this product from your library? This won't affect existing spray records."
          confirmLabel="Remove"
          onConfirm={() => {
            deleteMutation.mutate(pendingDeleteId);
            setPendingDeleteId(null);
          }}
          onCancel={() => setPendingDeleteId(null)}
          data-testid="product-delete-confirm"
        />
      )}
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1
            data-testid="products-heading"
            className="text-2xl font-bold text-slate-50"
          >
            Product Library
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your spray product dictionary. Only library products can be
            used when logging sprays.
          </p>
        </div>

        <Tabs
          tabs={PRODUCT_TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
          data-testid="products-tabs"
        />

        {activeTab === "add" && (
          <div
            id="products-tab-add"
            role="tabpanel"
            aria-labelledby="products-tab-add-tab"
          >
            <h2 className="mb-5 text-base font-semibold text-slate-200">
              Add product
            </h2>
            <Card data-testid="products-create-card">
              <form
                onSubmit={handleCreate}
                data-testid="products-create-form"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                noValidate
              >
                <Input
                  label="Product name"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="products-name-input"
                />
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="product-category"
                    className="text-sm font-medium text-slate-300"
                  >
                    Category
                  </label>
                  <select
                    id="product-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    data-testid="products-category-select"
                    className={selectClass}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {formError && (
                  <p
                    data-testid="products-form-error"
                    className="col-span-full rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-400"
                    role="alert"
                  >
                    {formError}
                  </p>
                )}

                <div className="col-span-full">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="products-create-submit"
                  >
                    {createMutation.isPending ? "Adding…" : "Add product"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {activeTab === "library" && (
          <div
            id="products-tab-library"
            role="tabpanel"
            aria-labelledby="products-tab-library-tab"
          >
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="text-base font-semibold text-slate-200">
                Library
                {filtered.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    ({filtered.length})
                  </span>
                )}
              </h2>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="filter-category"
                  className="text-xs font-medium text-slate-400"
                >
                  Filter by category
                </label>
                <select
                  id="filter-category"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  data-testid="products-category-filter"
                  className={`${selectClass} w-44`}
                >
                  <option value="">All categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {productsQuery.isLoading && (
              <p data-testid="products-loading" className="text-sm text-slate-500">
                Loading…
              </p>
            )}

            {productsQuery.isError && (
              <p
                data-testid="products-error"
                className="text-sm text-red-400"
                role="alert"
              >
                Failed to load products.
              </p>
            )}

            {productsQuery.isSuccess && filtered.length === 0 && (
              <p data-testid="products-empty" className="text-sm text-slate-500">
                {filterCategory
                  ? `No ${filterCategory} products in your library.`
                  : "No products yet. Add one in the Add product tab."}
              </p>
            )}

            {productsQuery.isSuccess && filtered.length > 0 && (
              <ul data-testid="products-list" className="flex flex-col gap-3">
                {filtered.map((product) => (
                  <li key={product.id}>
                    <Card
                      data-testid={`product-card-${product.id}`}
                      className="transition-shadow hover:shadow-md hover:shadow-slate-950/60"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p
                            data-testid={`product-name-${product.id}`}
                            className="text-sm font-medium text-slate-100"
                          >
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {product.category}
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          data-testid={`product-delete-${product.id}`}
                          onClick={() => setPendingDeleteId(product.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-400 hover:border-red-800 hover:bg-red-950/50"
                        >
                          Remove
                        </Button>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
