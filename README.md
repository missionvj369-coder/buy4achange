# BUY4ACHANGE (Buy4AChange)
### *Conscious Commerce Powered by UGT India*
**Directly Connected to Universal Guard Trust** — [ugtindia.space](https://ugtindia.space) & [ugtglobal.space](https://ugtglobal.space)

---

## 🌟 The 8 Official UGT India National Missions
Every product purchased through Buy4AChange gives the buyer full freedom to choose which UGT India national mission their purchase funds:

1. **Everyday Essentials**: Essential stores in every PIN code, ensuring everyday household spending stays within the community to build local livelihoods.
2. **Women Entrepreneurship**: Equipping rural and semi-urban women makers with tools, seed capital, and direct market access for sustainable micro-enterprises.
3. **AI Free Training**: Democratizing free artificial intelligence, digital literacy, and modern coding labs for youth across every district.
4. **Water Security**: Grassroots water harvesting, solar-powered community filtration plants, and reviving village wells and stepwells.
5. **Protect the Earth**: Regenerative organic agroforestry, native fruit forests, soil revival, and plastic-free loops.
6. **Hill and City**: Balanced, sustainable development respecting mountain ecosystems and urban ecological balance.
7. **Sports Ecosystem**: Scouting, coaching, and nurturing young athletic talent from streets to district and national levels.
8. **Living Culture**: Preserving regional Indian heritage, indigenous arts, handloom traditions, and bell-metal casting.

---

## 💎 Key Enhancements

### 🛍️ Customer Experience
- **Buyer Chooses the Mission on Every Product**: Every product card, product details view, and cart item has an interactive mission dropdown so buyers can support the exact cause they care about.
- **Pure Customer Storefront**: No administrative links or toggles cluttering the public storefront.
- **Dynamic Cause Calculation**: Displays the exact percentage (15%–25%) and rupee amount dedicated to the chosen mission in real time.
- **Clean, Production-Grade Checkout**: Auto-detects cities/states based on 6-digit Indian PIN codes, creates local UGT Guardian tracking IDs, and executes payments via the open-source payment switch without test clutter.

### 🔐 Dedicated Admin Operations Console (`/admin`)
- **Direct Route**: Accessible exclusively via `http://localhost:5000/admin`.
- **Configured Credentials**:
  - **Email**: `admin@ugtindia.space`
  - **Password**: `Admin@UGT2026!`
- **Daily Orders & Date Filtering**: Filter orders by **Today**, **Yesterday**, **Last 7 Days**, or **All**. Update order status (`Processing` $\rightarrow$ `Packed` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered`).
- **Ultra Facility: Shipping Label & Address Printout**:
  - 1-Click single label print or **Batch Print All Daily Orders**.
  - Formatted for standard 4x6" thermal labels or A4 dispatch sheets with high-res barcodes, tracking IDs (`UGT-EXP-...`), bold PIN codes, and official **Verified Cause Impact Parcel** declarations.
- **Product Catalog Management**: Add, Edit, Delete products, adjust stock, and set base mission allocations.
- **UGT Missions Tracker**: Real-time progress bars tracking funds raised vs target for each of the 8 national missions.
- **Cryptographic Audit Ledger**: Log of all completed transactions with switch transaction IDs (`pay_osm_...`).

---

## 🚀 How to Run Locally

```bash
# Navigate to project folder
cd C:\Users\sarav\.gemini\antigravity\scratch\buy4achange

# Run the complete application (Server + UI together on http://localhost:5000)
npm run start
```

- **Customer Storefront**: **[http://localhost:5000](http://localhost:5000)**
- **Admin Console**: **[http://localhost:5000/admin](http://localhost:5000/admin)**
  - *Login*: `admin@ugtindia.space` / `Admin@UGT2026!`
