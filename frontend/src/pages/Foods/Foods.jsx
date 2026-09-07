import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Clock3, CreditCard, Flame, Heart,
  HelpCircle, ImageOff, Leaf, MapPin, Minus, PackageCheck, Phone,
  Plus, Search, ShieldCheck, ShoppingBag, ShoppingCart,
  SlidersHorizontal, Sparkles, Star, Store, Trash2, User,
  UtensilsCrossed, X
} from "lucide-react";
import centuriaLogo from "../../assets/images/centuria-logo.png";
import "./Foods.css";

const HERO_SLIDES = [
  ["CENTURIA SIGNATURE DINING","Taste","The Difference","Fresh ingredients, authentic flavours and unforgettable dining moments.","https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2000&q=90"],
  ["SRI LANKAN FAVOURITES","Local","Flavours","Traditional Sri Lankan favourites prepared with premium ingredients and bold spices.","https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=2000&q=90"],
  ["SEAFOOD COLLECTION","Fresh","From The Sea","Prawns, fish, crab and cuttlefish served with a Centuria premium touch.","https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=2000&q=90"],
  ["GRILL & BBQ","Fire","And Flavour","Grilled meats and smoky barbecue favourites made to order for every guest.","https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2000&q=90"],
  ["SWEET MOMENTS","Dessert","Perfection","Finish your meal with rich cakes, puddings, ice cream and signature sweets.","https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=2000&q=90"],
  ["COOL & REFRESHING","Sip","Something Fresh","Fresh juices, shakes, smoothies and refreshing mocktails for every moment.","https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=2000&q=90"]
].map((x,i)=>({id:i+1,eyebrow:x[0],title:x[1],accent:x[2],description:x[3],image:x[4]}));

const CATEGORY_DATA = [
  ["sri-lankan","Sri Lankan Cuisine","Sri Lankan","🍛","#d32f2f",1250,["Traditional Rice & Curry","String Hoppers with Curry","Egg Hoppers","Milk Rice with Lunu Miris","Pittu with Coconut Milk","Pol Roti with Lunu Miris","Parippu Curry Plate","Lamprais","Chicken Lamprais"]],
  ["rice","Rice Dishes","Rice","🍚","#ef6c00",1450,["Chicken Fried Rice","Egg Fried Rice","Vegetable Fried Rice","Seafood Fried Rice","Mixed Fried Rice","Nasi Goreng","Biriyani Rice","Mongolian Rice","Special Centuria Fried Rice"]],
  ["chop-suey-rice","Chop Suey Rice","Chop Suey","🥘","#2e7d32",1650,["Chicken Chop Suey Rice","Vegetable Chop Suey Rice","Seafood Chop Suey Rice","Mixed Chop Suey Rice","Beef Chop Suey Rice","Prawn Chop Suey Rice","Special Centuria Chop Suey Rice","Hot & Spicy Chop Suey Rice","Egg Chop Suey Rice"]],
  ["kottu","Kottu","Kottu","🍲","#00838f",1350,["Chicken Kottu","Cheese Chicken Kottu","Egg Kottu","Vegetable Kottu","Seafood Kottu","Beef Kottu","Mutton Kottu","Dolphin Kottu","Special Centuria Kottu"]],
  ["chicken","Chicken","Chicken","🍗","#c2185b",1950,["Devilled Chicken","Grilled Chicken","Chicken Curry","Fried Chicken","BBQ Chicken","Chicken Steak","Butter Chicken","Sweet & Sour Chicken","Hot Butter Chicken"]],
  ["fish","Fish","Fish","🐟","#1565c0",2100,["Grilled Fish","Fried Fish","Fish Curry","Devilled Fish","Fish Steak","Fish & Chips","Hot Butter Fish","Garlic Butter Fish","Black Pepper Fish"]],
  ["prawns","Prawns","Prawns","🍤","#1976d2",2450,["Devilled Prawns","Garlic Butter Prawns","Grilled Prawns","Prawn Curry","Hot Butter Prawns","Sweet & Sour Prawns","Crispy Fried Prawns","Chilli Prawns","Black Pepper Prawns"]],
  ["cuttlefish","Cuttlefish","Cuttlefish","🦑","#5e35b1",2350,["Hot Butter Cuttlefish","Devilled Cuttlefish","Fried Cuttlefish","Grilled Cuttlefish","Cuttlefish Curry","Garlic Cuttlefish","Spicy Cuttlefish","Crispy Cuttlefish Rings","Black Pepper Cuttlefish"]],
  ["crab","Crab","Crab","🦀","#6a1b9a",2950,["Chilli Crab","Garlic Butter Crab","Black Pepper Crab","Sri Lankan Crab Curry","Grilled Crab","Devilled Crab","Steamed Crab","Spicy Seafood Crab","Centuria Special Crab"]],
  ["beef","Beef","Beef","🥩","#8d6e63",2550,["Beef Curry","Devilled Beef","Beef Steak","Grilled Beef","Beef Pepper Fry","Beef Stroganoff","BBQ Beef","Beef Chilli Fry","Garlic Butter Beef"]],
  ["mutton","Mutton","Mutton","🍖","#7b8d00",2650,["Mutton Curry","Devilled Mutton","Mutton Pepper Fry","Grilled Mutton","Mutton Masala","Mutton Rogan Josh","Mutton BBQ","Spicy Mutton Roast","Mutton Kebab Plate"]],
  ["pork","Pork","Pork","🥓","#ad1457",2450,["Pork Curry","Devilled Pork","BBQ Pork","Grilled Pork","Pork Chop","Black Pork Curry","Garlic Pork","Sweet & Sour Pork","Pork Pepper Fry"]],
  ["burgers","Burgers","Burgers","🍔","#e65100",1650,["Classic Beef Burger","Premium Cheeseburger","Crispy Chicken Burger","Grilled Chicken Burger","Double Beef Burger","BBQ Chicken Burger","Fish Burger","Vegetable Burger","Centuria Signature Burger"]],
  ["sandwiches-wraps","Sandwiches & Wraps","Sandwiches","🥪","#bf360c",1150,["Club Sandwich","Chicken Sandwich","Tuna Sandwich","Egg Sandwich","Cheese Sandwich","Chicken Wrap","Beef Wrap","Vegetable Wrap","Centuria Special Wrap"]],
  ["pizza","Pizza","Pizza","🍕","#d81b60",2200,["Margherita Pizza","Chicken Pizza","BBQ Chicken Pizza","Seafood Pizza","Pepperoni Pizza","Beef Pizza","Cheese Lovers Pizza","Vegetable Supreme Pizza","Centuria Signature Pizza"]],
  ["pasta-noodles","Pasta & Noodles","Pasta","🍝","#00796b",1650,["Chicken Alfredo Pasta","Spaghetti Bolognese","Seafood Pasta","Creamy Mushroom Pasta","Arrabbiata Pasta","Chicken Chow Mein","Seafood Noodles","Vegetable Noodles","Centuria Mixed Noodles"]],
  ["grill-bbq","Grill & BBQ","Grill & BBQ","🔥","#283593",2500,["BBQ Chicken Platter","Mixed Grill Platter","Grilled Beef Steak","Grilled Fish Steak","BBQ Pork Ribs","Grilled Prawns","Chicken Sausage Grill","Seafood Grill Platter","Centuria BBQ Combo"]],
  ["soups-salads","Soups & Salads","Soup & Salad","🥗","#388e3c",950,["Chicken Soup","Seafood Soup","Cream of Mushroom Soup","Vegetable Soup","Caesar Salad","Chicken Caesar Salad","Greek Salad","Fresh Garden Salad","Centuria Healthy Salad"]],
  ["desserts","Desserts","Desserts","🍰","#ad1457",850,["Chocolate Lava Cake","Cheesecake","Chocolate Brownie","Ice Cream Sundae","Watalappan","Fruit Salad","Caramel Pudding","Tiramisu","Centuria Dessert Platter"]],
  ["hot-drinks","Hot Drinks","Hot Drinks","☕","#6d4c41",350,["Ceylon Tea","Milk Tea","Black Coffee","Cappuccino","Cafe Latte","Espresso","Hot Chocolate","Green Tea","Centuria Special Coffee"]],
  ["cold-drinks-juices","Cold Drinks & Juices","Cold Drinks","🥤","#00838f",450,["Fresh Orange Juice","Fresh Mango Juice","Watermelon Juice","Pineapple Juice","Chocolate Milkshake","Strawberry Milkshake","Mixed Fruit Smoothie","Lime Mint Mocktail","Centuria Tropical Mocktail"]]
].map(([id,label,shortLabel,emoji,accent,basePrice,items])=>({id,label,shortLabel,emoji,accent,basePrice,items}));

const PORTIONS = { Regular:0, Medium:450, Large:850 };
const SPICES = ["No Spice","Mild","Medium","Spicy","Extra Spicy"];

function slugify(value){
  return value.toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}
function imagePath(categoryId,name){
  return `/foods/${categoryId}/${slugify(name)}.jpg`;
}
function readJson(key,fallback){
  try{ const v=localStorage.getItem(key); return v?JSON.parse(v):fallback; }
  catch{ return fallback; }
}
function money(v){ return `LKR ${Number(v||0).toLocaleString("en-LK")}`; }

function buildFoods(){
  let id=0;
  return CATEGORY_DATA.flatMap((c,ci)=>c.items.map((name,ii)=>{
    id++;
    const noSpice=["desserts","hot-drinks","cold-drinks-juices"].includes(c.id);
    const vegetarian=/vegetable|cheese|margherita|mushroom|fruit|tea|coffee|cappuccino|latte|espresso|chocolate|cheesecake|brownie|ice cream|watalappan|pudding|tiramisu|egg hopper|milk rice|pittu|pol roti|parippu/i.test(name);
    const vegan=/vegetable|fresh garden|fresh orange|fresh mango|watermelon|pineapple|lime mint|green tea|black coffee/i.test(name);
    return {
      id,name,categoryId:c.id,categoryLabel:c.label,shortCategory:c.shortLabel,
      accent:c.accent,basePrice:c.basePrice+ii*120+(ci%3)*80,
      rating:Number((4.4+((id*7)%6)/10).toFixed(1)),
      reviewCount:45+((id*37)%430),readyMinutes:15+((id*5)%21),
      style:ii%3===0?"Signature Dish":ii%3===1?"Fresh Made":"Chef Special",
      image:imagePath(c.id,name),vegetarian,vegan,
      spiceLevels:noSpice?["No Spice"]:SPICES,
      description:`${name} prepared with premium ingredients and the signature Centuria Lake Resort touch.`
    };
  }));
}
const ALL_FOODS=buildFoods();

function FoodImage({food,className=""}){
  const [failed,setFailed]=useState(false);
  return <div className={`food-image-slot ${className} ${failed?"is-empty":""}`}>
    {!failed?
      <img src={food.image} alt={food.name} loading="lazy" onError={()=>setFailed(true)}/>:
      <div className="food-image-placeholder">
        <ImageOff size={30}/>
        <strong>Image not added</strong>
        <span>{food.name}</span>
        <small>{food.image}</small>
      </div>
    }
  </div>;
}

export default function Foods(){
  const navigate=useNavigate();
  const catRef=useRef(null);
  const menuRef=useRef(null);

  const [heroIndex,setHeroIndex]=useState(0);
  const [category,setCategory]=useState("all");
  const [search,setSearch]=useState("");
  const [maxPrice,setMaxPrice]=useState(7000);
  const [spiceFilter,setSpiceFilter]=useState([]);
  const [dietFilter,setDietFilter]=useState([]);
  const [sort,setSort]=useState("popular");
  const [favorites,setFavorites]=useState(()=>readJson("centuria_food_favorites",[]));
  const [cart,setCart]=useState(()=>readJson("centuria_food_cart",[]));
  const [selections,setSelections]=useState({});
  const [visible,setVisible]=useState(27);
  const [savedOnly,setSavedOnly]=useState(false);
  const [filtersOpen,setFiltersOpen]=useState(false);
  const [order,setOrder]=useState(null);
  const [orderPortion,setOrderPortion]=useState("Regular");
  const [orderSpice,setOrderSpice]=useState("Medium");
  const [qty,setQty]=useState(1);
  const [cartOpen,setCartOpen]=useState(false);

  const user=readJson("centuria_user",null);
  const hero=HERO_SLIDES[heroIndex];

  useEffect(()=>{
    const t=setInterval(()=>setHeroIndex(v=>v===HERO_SLIDES.length-1?0:v+1),5000);
    return ()=>clearInterval(t);
  },[]);
  useEffect(()=>localStorage.setItem("centuria_food_favorites",JSON.stringify(favorites)),[favorites]);
  useEffect(()=>localStorage.setItem("centuria_food_cart",JSON.stringify(cart)),[cart]);
  useEffect(()=>setVisible(27),[category,search,maxPrice,spiceFilter,dietFilter,sort,savedOnly]);

  const filtered=useMemo(()=>{
    const q=search.trim().toLowerCase();
    const list=ALL_FOODS.filter(f=>{
      if(category!=="all"&&f.categoryId!==category)return false;
      if(savedOnly&&!favorites.includes(f.id))return false;
      if(f.basePrice>maxPrice)return false;
      if(q&&!`${f.name} ${f.categoryLabel}`.toLowerCase().includes(q))return false;
      if(spiceFilter.length&&!spiceFilter.some(s=>f.spiceLevels.includes(s)))return false;
      if(dietFilter.includes("Vegetarian")&&!f.vegetarian)return false;
      if(dietFilter.includes("Vegan")&&!f.vegan)return false;
      return true;
    });
    return [...list].sort((a,b)=>{
      if(sort==="rating")return b.rating-a.rating;
      if(sort==="price-low")return a.basePrice-b.basePrice;
      if(sort==="price-high")return b.basePrice-a.basePrice;
      if(sort==="az")return a.name.localeCompare(b.name);
      return b.reviewCount-a.reviewCount;
    });
  },[category,search,maxPrice,spiceFilter,dietFilter,sort,savedOnly,favorites]);

  const saved=useMemo(()=>ALL_FOODS.filter(f=>favorites.includes(f.id)).slice(0,6),[favorites]);
  const subtotal=useMemo(()=>cart.reduce((sum,item)=>sum+Number(item.total||0),0),[cart]);

  const getSel=f=>selections[f.id]||{portion:"Regular",spice:f.spiceLevels.length===1?"No Spice":"Medium"};
  const setSel=(f,key,value)=>setSelections(prev=>({...prev,[f.id]:{...getSel(f),[key]:value}}));
  const price=f=>f.basePrice+PORTIONS[getSel(f).portion];
  const toggleFavorite=id=>setFavorites(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);

  const chooseCategory=id=>{
    setCategory(id);
    setSavedOnly(false);
    setTimeout(()=>menuRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),80);
  };

  const openOrder=f=>{
    const s=getSel(f);
    setOrder(f);
    setOrderPortion(s.portion);
    setOrderSpice(s.spice);
    setQty(1);
  };

  const orderTotal=order?(order.basePrice+PORTIONS[orderPortion])*qty:0;

  const addCart=()=>{
    if(!order)return;
    const item={
      cartId:`${order.id}-${Date.now()}`,foodId:order.id,name:order.name,image:order.image,
      category:order.categoryLabel,portion:orderPortion,spice:orderSpice,quantity:qty,
      unitPrice:order.basePrice+PORTIONS[orderPortion],total:orderTotal
    };
    setCart(prev=>[...prev,item]);
    setOrder(null);
    setCartOpen(true);
  };

  const singlePayment=()=>{
    if(!order)return;
    localStorage.setItem("centuria_food_checkout",JSON.stringify({
      type:"food",foodId:order.id,name:order.name,category:order.categoryLabel,
      image:order.image,portion:orderPortion,spice:orderSpice,quantity:qty,
      unitPrice:order.basePrice+PORTIONS[orderPortion],total:orderTotal,createdAt:new Date().toISOString()
    }));
    setOrder(null);
    navigate("/food-payment");
  };

  const cartPayment=()=>{
    if(!cart.length)return;
    localStorage.setItem("centuria_food_checkout",JSON.stringify({
      type:"food-cart",items:cart,total:subtotal,createdAt:new Date().toISOString()
    }));
    setCartOpen(false);
    navigate("/food-payment");
  };

  const toggleList=(setter,current,value)=>setter(current.includes(value)?current.filter(x=>x!==value):[...current,value]);
  const clearFilters=()=>{setCategory("all");setSearch("");setMaxPrice(7000);setSpiceFilter([]);setDietFilter([]);setSort("popular");setSavedOnly(false);};

  return <div className="foods-page">
    <div className="foods-topbar">
      <div><a href="mailto:info@centuria.lk"><HelpCircle size={14}/>info@centuria.lk</a><span/><a href="tel:+94472232232"><Phone size={14}/>+94 47 223 2232</a></div>
      <div><button type="button"><MapPin size={14}/>Location</button><button type="button"><HelpCircle size={14}/>Help Center</button></div>
    </div>

    <header className="foods-header">
      <button className="foods-brand" type="button" onClick={()=>navigate("/home")}>
        <span><img src={centuriaLogo} alt="Centuria Lake Resort"/></span>
        <div><strong>CENTURIA</strong><small>LAKE RESORT</small></div>
      </button>
      <nav className="foods-nav">
        {[["Home","/home"],["About","/about"],["Rooms","/rooms"],["Foods","/foods"],["Tours","/tours"],["Spa","/spa"],["Offers","/offers"],["Contact","/contact"]].map(([label,route])=>
          <button key={label} type="button" className={label==="Foods"?"active":""} onClick={()=>navigate(route)}>{label}</button>
        )}
      </nav>
      <div className="foods-header-actions">
        <label className="foods-header-search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search food, cuisine or dish..."/></label>
        <button type="button" className="foods-cart-button" onClick={()=>setCartOpen(true)}><ShoppingCart size={21}/>{cart.length>0&&<span>{cart.length}</span>}</button>
        {user?<button type="button" className="foods-user" onClick={()=>navigate("/customer-dashboard")}>
          <span>{user.profile_image?<img src={user.profile_image} alt="Profile"/>:<User size={19}/>}</span>
          <div><strong>{user.full_name||user.name||"Centuria Guest"}</strong><small>Premium Member</small></div>
        </button>:<button type="button" className="foods-login" onClick={()=>navigate("/portal?mode=login")}><User size={16}/>Login</button>}
      </div>
    </header>

    <section className="foods-hero">
      <AnimatePresence mode="wait">
        <motion.div key={hero.id} className="foods-hero-image" initial={{opacity:0,scale:1.03}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:.7}}>
          <img src={hero.image} alt={hero.title}/>
        </motion.div>
      </AnimatePresence>
      <div className="foods-hero-overlay"/>
      <button type="button" className="foods-hero-arrow left" onClick={()=>setHeroIndex(v=>v===0?HERO_SLIDES.length-1:v-1)}><ChevronLeft/></button>
      <div className="foods-hero-content">
        <span>{hero.eyebrow}</span><h1>{hero.title}<em>{hero.accent}</em></h1><p>{hero.description}</p>
        <div><strong>Fresh Ingredients</strong><i/><strong>Authentic Flavours</strong><i/><strong>Unforgettable Moments</strong></div>
      </div>
      <div className="foods-hero-side"><Sparkles/><strong>GOOD FOOD</strong><strong>GOOD MOOD</strong><span>Only at</span><small>Centuria Lake Resort</small></div>
      <button type="button" className="foods-hero-arrow right" onClick={()=>setHeroIndex(v=>v===HERO_SLIDES.length-1?0:v+1)}><ChevronRight/></button>
      <div className="foods-hero-dots">{HERO_SLIDES.map((h,i)=><button key={h.id} type="button" className={heroIndex===i?"active":""} onClick={()=>setHeroIndex(i)}/>)}</div>
    </section>

    <section className="foods-category-shell">
      <button type="button" onClick={()=>catRef.current?.scrollBy({left:-650,behavior:"smooth"})}><ChevronLeft/></button>
      <div ref={catRef} className="foods-category-strip">
        <button type="button" className={`foods-category all ${category==="all"&&!savedOnly?"active":""}`} onClick={()=>chooseCategory("all")}><Store/><strong>All Foods</strong><small>{ALL_FOODS.length} dishes</small></button>
        {CATEGORY_DATA.map(c=><button key={c.id} type="button" className={`foods-category ${category===c.id&&!savedOnly?"active":""}`} style={{"--category-accent":c.accent}} onClick={()=>chooseCategory(c.id)}>
          <span>{c.emoji}</span><strong>{c.shortLabel}</strong><small>9 dishes</small>
        </button>)}
      </div>
      <button type="button" onClick={()=>catRef.current?.scrollBy({left:650,behavior:"smooth"})}><ChevronRight/></button>
    </section>

    <main className="foods-layout">
      <aside className={`foods-filters ${filtersOpen?"open":""}`}>
        <div className="panel-title"><Search/><div><strong>Search & Filter</strong><small>Find your perfect dish</small></div></div>
        <label className="side-search"><Search/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search food items..."/></label>
        <div className="filter-block"><div className="filter-row"><strong>Price Range</strong><span>LKR 0 - {maxPrice}</span></div><input type="range" min="500" max="7000" step="250" value={maxPrice} onChange={e=>setMaxPrice(Number(e.target.value))}/></div>
        <div className="filter-block"><strong>Spice Level</strong>{SPICES.map(s=><label className="check-row" key={s}><input type="checkbox" checked={spiceFilter.includes(s)} onChange={()=>toggleList(setSpiceFilter,spiceFilter,s)}/><span>{s}</span><em>{s==="No Spice"?"🌿":s==="Mild"?"🌶️":s==="Medium"?"🌶️🌶️":s==="Spicy"?"🔥":"🔥🔥"}</em></label>)}</div>
        <div className="filter-block"><strong>Dietary</strong>{["Vegetarian","Vegan"].map(d=><label className="check-row" key={d}><input type="checkbox" checked={dietFilter.includes(d)} onChange={()=>toggleList(setDietFilter,dietFilter,d)}/><span>{d}</span><Leaf size={13}/></label>)}</div>
        <div className="filter-actions"><button type="button" onClick={clearFilters}>Clear Filters</button><button type="button" onClick={()=>setFiltersOpen(false)}>Apply Filters</button></div>
      </aside>

      <div className="foods-center">
        <section className="foods-saved">
          <div className="section-title"><div><Heart fill="currentColor"/><span><strong>Saved Items</strong><small>Your favourite dishes in one place</small></span></div><button type="button" onClick={()=>{setSavedOnly(true);setTimeout(()=>menuRef.current?.scrollIntoView({behavior:"smooth"}),50)}}>View All</button></div>
          {saved.length===0?<div className="saved-empty"><Heart/><span><strong>No saved foods yet</strong><small>Tap the heart on any dish to save it here.</small></span></div>:
          <div className="saved-grid">{saved.map(f=><button key={f.id} type="button" className="saved-card" onClick={()=>openOrder(f)}>
            <FoodImage food={f} className="saved-image"/><span className="saved-card-copy"><strong>{f.name}</strong><small>{money(f.basePrice)}</small></span><em><Star fill="currentColor"/>{f.rating}</em>
          </button>)}</div>}
        </section>

        <section className="foods-menu" ref={menuRef}>
          <div className="section-title menu-title">
            <div><Flame/><span><strong>{savedOnly?"Saved Foods":category==="all"?"All Centuria Foods":CATEGORY_DATA.find(c=>c.id===category)?.label}</strong><small>{filtered.length} dishes available</small></span></div>
            <div className="menu-tools"><button type="button" onClick={()=>setFiltersOpen(true)}><SlidersHorizontal/>Filters</button><select value={sort} onChange={e=>setSort(e.target.value)}><option value="popular">Sort by: Popular</option><option value="rating">Highest Rated</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="az">Name: A-Z</option></select></div>
          </div>

          {filtered.length===0?<div className="no-results"><Search/><h3>No foods found</h3><p>Try changing your search or filters.</p><button type="button" onClick={clearFilters}>Reset Filters</button></div>:
          <>
            <div className="food-grid">
              {filtered.slice(0,visible).map((f,index)=>{
                const s=getSel(f);
                return <motion.article className="food-card" key={f.id} initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
                  <div className="food-card-gold-line"/>
                  <div className="food-card-image-wrap">
                    <FoodImage food={f} className="food-main-image"/>
                    <span className="food-card-badge">{["Best Seller","Chef's Choice","Popular","Recommended","Hot Item"][index%5]}</span>
                    <button type="button" className={`food-card-heart ${favorites.includes(f.id)?"active":""}`} onClick={()=>toggleFavorite(f.id)}><Heart fill={favorites.includes(f.id)?"currentColor":"none"}/></button>
                    <small>{f.shortCategory}</small>
                  </div>
                  <div className="food-body">
                    <div className="food-title"><h3>{f.name}</h3><span><Star fill="currentColor"/>{f.rating}<small>({f.reviewCount})</small></span></div>
                    <p>{f.description}</p>
                    <div className="food-meta"><div><Clock3/><span><small>READY IN</small><strong>{f.readyMinutes} Min</strong></span></div><div><UtensilsCrossed/><span><small>STYLE</small><strong>{f.style}</strong></span></div></div>
                    <div className="portion-box"><div><span>PORTION</span><strong>Choose Size</strong></div><div>{Object.keys(PORTIONS).map(p=><button key={p} type="button" className={s.portion===p?"active":""} onClick={()=>setSel(f,"portion",p)}>{p}</button>)}</div></div>
                    <div className="spice-row"><label><Flame/>Spice Level</label><select value={s.spice} onChange={e=>setSel(f,"spice",e.target.value)}>{f.spiceLevels.map(x=><option key={x}>{x}</option>)}</select></div>
                    <div className="price-row"><span><small>TOTAL PRICE</small><strong>{money(price(f))}</strong></span><em>{s.portion}</em></div>
                    <button type="button" className="order-btn" onClick={()=>openOrder(f)}><ShoppingCart/>Order Now<ChevronRight/></button>
                  </div>
                </motion.article>;
              })}
            </div>
            {visible<filtered.length&&<button type="button" className="load-more" onClick={()=>setVisible(v=>v+27)}>Load More Foods<ChevronRight/></button>}
          </>}
        </section>
      </div>

      <aside className="foods-right">
        <section className="special-card"><img src="https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=90" alt="Special offer"/><div/><span>Special</span><h3>OFFERS</h3><p>Delicious meals at amazing prices.</p><button type="button" onClick={()=>navigate("/offers")}>View Offers</button></section>
        <section className="why-card"><h3>Why Choose Our Foods?</h3>{[[Leaf,"Fresh & high quality ingredients"],[UtensilsCrossed,"Expert chefs"],[Store,"Wide variety of dishes"],[SlidersHorizontal,"Customizable options"],[ShieldCheck,"Safe & hygienic preparation"],[Clock3,"Fast & reliable service"]].map(([Icon,text])=><span key={text}><Icon/>{text}</span>)}</section>
        <section className="order-info"><div><PackageCheck/><span><strong>Easy Ordering</strong><small>Choose dish, portion and spice level.</small></span></div><div><CreditCard/><span><strong>Secure Payment</strong><small>Continue to the payment page.</small></span></div></section>
      </aside>
    </main>

    <AnimatePresence>
      {order&&<motion.div className="order-modal-bg" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setOrder(null)}>
        <motion.div className="order-modal" initial={{opacity:0,y:20,scale:.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:15,scale:.96}} onClick={e=>e.stopPropagation()}>
          <button className="modal-close" type="button" onClick={()=>setOrder(null)}><X/></button>
          <FoodImage food={order} className="modal-image"/>
          <div className="modal-copy">
            <span>{order.categoryLabel}</span><h2>{order.name}</h2><p>{order.description}</p>
            <div className="modal-rating"><Star fill="currentColor"/>{order.rating}<small>({order.reviewCount} reviews)</small></div>
            <div className="modal-group"><label>Portion</label><div>{Object.keys(PORTIONS).map(p=><button key={p} type="button" className={orderPortion===p?"active":""} onClick={()=>setOrderPortion(p)}>{p}<small>{PORTIONS[p]===0?"Base":`+ ${money(PORTIONS[p])}`}</small></button>)}</div></div>
            <div className="modal-field"><label>Spice Level</label><select value={orderSpice} onChange={e=>setOrderSpice(e.target.value)}>{order.spiceLevels.map(s=><option key={s}>{s}</option>)}</select></div>
            <div className="qty-row"><label>Quantity</label><div><button type="button" onClick={()=>setQty(q=>Math.max(1,q-1))}><Minus/></button><strong>{qty}</strong><button type="button" onClick={()=>setQty(q=>Math.min(20,q+1))}><Plus/></button></div></div>
            <div className="modal-total"><span>Total Amount</span><strong>{money(orderTotal)}</strong></div>
            <div className="modal-actions"><button type="button" onClick={addCart}><ShoppingCart/>Add to Cart</button><button type="button" onClick={singlePayment}><CreditCard/>Continue to Payment<ChevronRight/></button></div>
          </div>
        </motion.div>
      </motion.div>}
    </AnimatePresence>

    <AnimatePresence>
      {cartOpen&&<>
        <motion.div className="cart-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setCartOpen(false)}/>
        <motion.aside className="cart-drawer" initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring",damping:28,stiffness:260}}>
          <div className="cart-header"><div><ShoppingBag/><span><strong>Your Food Cart</strong><small>{cart.length} item{cart.length===1?"":"s"}</small></span></div><button type="button" onClick={()=>setCartOpen(false)}><X/></button></div>
          {cart.length===0?<div className="cart-empty"><ShoppingCart/><h3>Your cart is empty</h3><p>Add your favourite Centuria foods to continue.</p><button type="button" onClick={()=>setCartOpen(false)}>Browse Foods</button></div>:
          <>
            <div className="cart-list">{cart.map(item=><article className="cart-item" key={item.cartId}>
              <div className="cart-thumb"><img src={item.image} alt={item.name} onError={e=>{e.currentTarget.style.display="none"}}/><ImageOff/></div>
              <div className="cart-copy"><strong>{item.name}</strong><span>{item.portion} • {item.spice}</span><small>Qty {item.quantity} × {money(item.unitPrice)}</small><em>{money(item.total)}</em></div>
              <button type="button" className="cart-remove" onClick={()=>setCart(prev=>prev.filter(x=>x.cartId!==item.cartId))}><Trash2/></button>
            </article>)}</div>
            <div className="cart-summary"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><button type="button" className="cart-checkout" onClick={cartPayment}><CreditCard/>Continue to Payment<ChevronRight/></button><button type="button" className="cart-clear" onClick={()=>setCart([])}><Trash2/>Clear Cart</button></div>
          </>}
        </motion.aside>
      </>}
    </AnimatePresence>
  </div>;
}
