# AI-Based Recommendation System for E-Commerce

A full-stack e-commerce web application with an integrated AI-powered product recommendation engine. The system personalizes product suggestions based on user purchase history, wishlist activity, and browsing behavior — built as a progressive three-stage ML project.

---

## Live Architecture

```
ecommerce-frontend  (React 19 + Vite + TypeScript)   → port 5173
       ↕  /api/*  proxy
backend             (Next.js 16 API routes)           → port 3000
       ↕  HTTP
ai-service          (FastAPI + scikit-learn)          → port 8000
       ↕  SQL
Supabase            (PostgreSQL + Auth + RLS)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript, TailwindCSS v4 |
| Backend | Next.js 16 (API routes only) |
| AI Service | FastAPI (Python), scikit-learn, pandas, numpy, joblib |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Auth | Supabase Auth (email/password) |
| Styling | TailwindCSS v4 with `@theme` (no config file), Inter font |

---

## Features

- **User Authentication** — Sign up / Sign in with Supabase Auth; auto-creates user profile via database trigger (SECURITY DEFINER)
- **Product Browsing** — Category pages, product detail, search with autocomplete dropdown
- **Cart & Checkout** — Full cart management, address form, order placement with order number generation
- **Wishlist** — Supabase-synced wishlist; guest wishlist merged on login
- **Order History** — View all past orders and individual order detail pages
- **Profile Page** — 6-tab profile: Personal Info, Orders, Wishlist, For You (AI Recommendations), Preferences, Addresses
- **AI Recommendations** — "For You" tab powered by Stage 1 ML model; derives user features from purchase history
- **Search Autocomplete** — Recent searches (localStorage), category matches, popular suggestions

---

## Dataset

**Customer Purchase Behavior Dataset (E-Commerce)**
Kaggle: [https://www.kaggle.com/datasets/gauthamvijayaraj/customer-purchase-behavior-dataset-e-commerce](https://www.kaggle.com/datasets/gauthamvijayaraj/customer-purchase-behavior-dataset-e-commerce)

The dataset contains:
- Customer demographic information (age, gender, location)
- Purchase history (product categories, order frequency, order value)
- Behavioral signals (browsing time, return rate, discount usage)
- Satisfaction scores and churn labels

This dataset is used to train the Stage 1 classification model that predicts a user's next likely purchase category based on their behavioral profile.

---

## AI Recommendation System — Stage 1 (Current)

### Approach: Supervised Classification with Logistic Regression

The current implementation uses a **Logistic Regression classifier** trained on the Kaggle dataset above. Rather than trying to predict a single product, the model predicts which **product category** a user is most likely to purchase next.

### How It Works

```
User logs in
    ↓
Backend queries Supabase for user's order history + preferences
    ↓
Feature vector is derived:
  - total_orders (int)
  - avg_order_value (float, in USD)
  - wishlist_size (int)
  - preferred_category_encoded (int, one-hot position)
    ↓
POST /predict → ai-service (FastAPI)
    ↓
LogisticRegression model returns predicted category
    ↓
Backend fetches mock/real products from that category
    ↓
"For You" tab renders personalized product grid
```

### Features Used for Prediction

| Feature | Description |
|---|---|
| `total_orders` | Number of orders placed by the user |
| `avg_order_value` | Average spend per order (USD) |
| `wishlist_size` | Number of items in wishlist (intent signal) |
| `preferred_category` | Most frequent category purchased (label-encoded) |

### Model File

The trained model is serialized with `joblib` and loaded at FastAPI startup:

```
ai-service/
├── main.py                  # FastAPI app with /predict and /health endpoints
├── requirements.txt         # Python dependencies
└── models/
    └── stage1_purchase_model.pkl   # Trained LogisticRegression (not committed)
```

> **Note:** The `.pkl` file is excluded from version control (`.gitignore`). To use the model, train it locally or copy from your training environment.

### ai-service API

```http
GET  /health
POST /predict
```

**Request body for `/predict`:**
```json
{
  "total_orders": 5,
  "avg_order_value": 45.2,
  "wishlist_size": 3,
  "preferred_category": 2
}
```

**Response:**
```json
{
  "predicted_category": "Electronics",
  "confidence": 0.78,
  "model": "LogisticRegression-stage1"
}
```

### Rule-Based Fallback

If the `.pkl` file is not found at startup, `ai-service` automatically falls back to a **rule-based heuristic**:

```python
if avg_order_value > 100:   → "Electronics"
elif wishlist_size > 5:     → "Fashion"
elif total_orders > 10:     → "Home & Kitchen"
else:                       → "Books"
```

This ensures the recommendation endpoint never fails, even without the trained model.

---

## Project Setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- Supabase project (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/hackgod011/AI-based-Recommendation-System-for-Ecommerce-Website.git
cd AI-based-Recommendation-System-for-Ecommerce-Website/ecommerce-ai
```

### 2. Frontend

```bash
cd ecommerce-frontend
cp .env.example .env.local   # fill in Supabase keys
npm install
npm run dev                  # http://localhost:5173
```

**Required env vars (`ecommerce-frontend/.env.local`):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
```

### 3. Backend

```bash
cd backend
cp .env.example .env.local   # fill in Supabase keys
npm install
npm run dev                  # http://localhost:3000
```

**Required env vars (`backend/.env.local`):**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> The `SUPABASE_SERVICE_ROLE_KEY` is required for the recommendations endpoint to read user data server-side (bypasses Row Level Security).

### 4. AI Service

```bash
cd ai-service
pip install -r requirements.txt

# Copy your trained model (or let it use rule-based fallback)
mkdir -p models
cp /path/to/stage1_purchase_model.pkl models/

uvicorn main:app --reload --port 8000
```

### 5. Database

Run the full SQL schema in your Supabase SQL Editor (see `database/schema.sql` if available, or contact maintainer). Key tables:

- `users`, `user_preferences` — profile and category preferences
- `orders`, `order_items` — purchase history (drives AI features)
- `wishlist` — intent signals for recommendations
- `cart_items`, `addresses`, `payment_methods`
- `product_interactions`, `recommendations` — AI pipeline data

Enable **Row Level Security** on all tables. The schema includes a `handle_new_user()` trigger that auto-creates user profile rows on signup.

---

## Project Structure

```
ecommerce-ai/
├── ecommerce-frontend/          # React 19 + Vite frontend
│   └── src/
│       ├── App.tsx
│       ├── context/
│       │   ├── AuthContext.tsx       # Supabase auth
│       │   ├── CartContext.tsx
│       │   └── WishlistContext.tsx   # Supabase-synced wishlist
│       ├── components/
│       │   ├── navbar/Navbar.tsx     # Search autocomplete
│       │   └── pages/
│       │       ├── ProfilePage.tsx   # AI recommendations ("For You" tab)
│       │       ├── CheckoutPage.tsx
│       │       ├── OrdersPage.tsx
│       │       ├── SignInPage.tsx
│       │       └── SignUpPage.tsx
│       └── lib/supabase.ts           # Typed Supabase client
│
├── backend/                     # Next.js 16 API routes
│   └── src/app/api/
│       ├── products/route.js        # RapidAPI + MOCK fallback
│       ├── search/route.js
│       └── recommendations/route.js # Derives features → calls ai-service
│
└── ai-service/                  # FastAPI Python service
    ├── main.py                  # /predict + /health
    ├── requirements.txt
    └── models/
        └── stage1_purchase_model.pkl
```

---

## Future Enhancements — AI Recommendation Stages

This project is designed as a **three-stage ML progression**, moving from classical ML to deep learning architectures used in industry.

---

### Stage 2 — Neural Collaborative Filtering (NCF)

**Core idea:** Instead of hand-crafted features, learn dense vector representations (embeddings) for both users and items. The model learns which users are similar and which items co-occur in purchase histories.

**Architecture:**
```
User ID → Embedding(64) ──┐
                           ├─→ MLP [256 → 128 → 64 → 1] → Purchase probability
Item ID → Embedding(64) ──┘
```

**Training:**
- Loss: Binary Cross-Entropy (purchased = 1, not purchased = 0)
- Negative sampling: randomly sample unpurchased items as negatives
- Optimizer: Adam

**Why it's better than Stage 1:**
- Captures latent user-item relationships that feature engineering misses
- Handles sparse interaction matrices gracefully
- Scales to millions of users and products

**Evaluation metrics:**
- Hit Rate @ K (HR@10) — did the purchased item appear in top 10 recommendations?
- NDCG @ K — did the purchased item rank higher in the top-K list?

**Dataset:** Same Kaggle dataset + real interaction logs from the app's `product_interactions` table.

**Implementation plan:**
```python
# PyTorch skeleton
class NCF(nn.Module):
    def __init__(self, n_users, n_items, emb_dim=64):
        self.user_emb = nn.Embedding(n_users, emb_dim)
        self.item_emb = nn.Embedding(n_items, emb_dim)
        self.mlp = nn.Sequential(
            nn.Linear(emb_dim * 2, 256), nn.ReLU(),
            nn.Linear(256, 128), nn.ReLU(),
            nn.Linear(128, 1), nn.Sigmoid()
        )
    def forward(self, user_ids, item_ids):
        u = self.user_emb(user_ids)
        i = self.item_emb(item_ids)
        return self.mlp(torch.cat([u, i], dim=-1))
```

---

### Stage 3 — Two-Tower Neural Network (Industry Standard)

**Core idea:** Build two separate encoder networks — one for users, one for items. The recommendation score is the **cosine similarity** between the two output vectors. This is the architecture used by Google, YouTube, Pinterest, and Spotify at scale.

**Architecture:**
```
User features              Item features
(history, prefs,           (category, price,
 demographics)             description embeddings)
      ↓                          ↓
 User Tower                 Item Tower
[FC → ReLU → FC]           [FC → ReLU → FC]
      ↓                          ↓
  user_vector(128)     ←cosine→  item_vector(128)
```

**Why industry uses this:**
- **Offline indexing:** Item vectors are pre-computed and indexed with ANN (Approximate Nearest Neighbor) libraries like FAISS or ScaNN
- **Sub-millisecond inference:** At query time, only the user vector is computed; nearest items are retrieved from the pre-built index
- **Scalability:** Works for catalogs with 100M+ items without iterating over all items at inference

**Training:**
- In-batch negatives (other items in the same training batch act as negatives)
- Contrastive loss / in-batch softmax
- Periodic re-indexing of item embeddings (daily or hourly)

**LLM Cold-Start Layer (Optional):**
For new users with no history, an LLM (e.g., Claude API) can be used to:
- Parse natural language preferences ("I like hiking and outdoor gear")
- Generate a pseudo user-vector from text description
- Bridge the cold-start gap until enough interactions are collected

> **Note:** The LLM is used only for cold-start initialization and explanation generation — not for ranking. The Two-Tower model handles all ranking.

**Integration with current app:**
```
New user signs up
    ↓
LLM generates initial preference vector from onboarding quiz
    ↓
Two-Tower model finds nearest item vectors (FAISS)
    ↓
Recommendations shown immediately on first visit
    ↓
As user shops, real interaction data replaces LLM-generated vector
```

---

### Stage Comparison

| | Stage 1 (Current) | Stage 2 (Next) | Stage 3 (Future) |
|---|---|---|---|
| Model | Logistic Regression | Neural CF (PyTorch) | Two-Tower Network |
| Input | Hand-crafted features | User ID + Item ID | User features + Item features |
| Output | Category prediction | Item purchase probability | Cosine similarity score |
| Cold-start handling | Rule-based fallback | Poor (needs history) | LLM-assisted |
| Scalability | High (stateless) | Medium | Very high (ANN indexing) |
| Interpretability | High | Low | Low |
| Industry usage | Baseline | Research benchmark | Production standard |

---

## Why This Project Matters

1. **End-to-end ML integration** — not just a notebook; the model is served via REST API and consumed by a real frontend
2. **Realistic data pipeline** — user signals (orders, wishlist, preferences) are collected in production and fed back into the model
3. **Progressive architecture** — each stage is a natural upgrade of the previous, teaching both classical and deep learning approaches
4. **Production patterns** — Row Level Security, service role keys, fallback chains, and typed interfaces mirror real industry practices

---

## Contributing

This project is part of a 30-day course challenge. Contributions and suggestions are welcome via GitHub issues.

---

## License

MIT
