from pokealert.detect import Status, detect_page, find_listings, looks_blocked, matches_keywords


def ld(availability, price="49.99", name="Prismatic Evolutions Elite Trainer Box"):
    return f"""<html><head><title>Store</title>
    <script type="application/ld+json">
    {{"@context":"https://schema.org","@type":"Product","name":"{name}",
      "offers":{{"@type":"Offer","price":"{price}","availability":"{availability}"}}}}
    </script></head><body><button>Add to cart</button></body></html>"""


def test_json_ld_in_stock():
    d = detect_page(ld("https://schema.org/InStock"))
    assert d.status == Status.IN_STOCK
    assert d.price == 49.99
    assert d.title == "Prismatic Evolutions Elite Trainer Box"


def test_json_ld_preorder():
    assert detect_page(ld("http://schema.org/PreOrder")).status == Status.PREORDER


def test_json_ld_beats_a_stray_add_to_cart_button():
    # Recommendation carousels have "Add to cart" buttons; structured data is about this product.
    assert detect_page(ld("https://schema.org/OutOfStock")).status == Status.OUT_OF_STOCK


def test_json_ld_any_buyable_variant_wins():
    html = """<script type="application/ld+json">
    {"@type":"Product","name":"Bundle","offers":[
      {"availability":"https://schema.org/OutOfStock","price":"30"},
      {"availability":"https://schema.org/InStock","price":"35"}]}</script>"""
    d = detect_page(html)
    assert d.status == Status.IN_STOCK and d.price == 35


def test_broken_json_ld_falls_back_to_buttons():
    html = '<script type="application/ld+json">{not json</script><button>Pre-order now</button>'
    assert detect_page(html).status == Status.PREORDER


def test_microdata():
    html = """<div itemscope itemtype="https://schema.org/Product">
      <link itemprop="availability" href="https://schema.org/SoldOut">
      <meta itemprop="price" content="12,99"></div>"""
    d = detect_page(html)
    assert d.status == Status.OUT_OF_STOCK and d.price == 12.99


def test_enabled_add_to_cart_button():
    assert detect_page("<button class='atc'>Add to Cart</button>").status == Status.IN_STOCK


def test_disabled_button_is_not_buyable():
    html = "<button disabled>Add to cart</button><button disabled>Sold Out</button>"
    assert detect_page(html).status == Status.OUT_OF_STOCK


def test_coming_soon_button():
    assert detect_page("<button>Notify me when available</button>").status == Status.COMING_SOON


def test_out_of_stock_wording_without_buttons():
    assert detect_page("<p>This item is currently unavailable.</p>").status == Status.OUT_OF_STOCK


def test_nothing_recognisable_is_unknown():
    assert detect_page("<p>Hello</p>").status == Status.UNKNOWN


def test_selector_limits_scope():
    html = """<div id="buy"><button disabled>Sold out</button></div>
              <div id="recs"><button>Add to cart</button></div>"""
    assert detect_page(html, selector="#buy").status == Status.OUT_OF_STOCK


def test_custom_text_wins_and_out_beats_in():
    html = "<p>Add to Bag</p><p>Item unavailable in your region</p>"
    d = detect_page(html, in_stock_text=["add to bag"], out_of_stock_text=["unavailable in your region"])
    assert d.status == Status.OUT_OF_STOCK
    assert detect_page(html, in_stock_text=["add to bag"]).status == Status.IN_STOCK


def test_scripts_are_ignored():
    html = "<script>var label = 'Add to cart';</script><p>Sold out</p>"
    assert detect_page(html).status == Status.OUT_OF_STOCK


def test_blocked_pages():
    assert looks_blocked(403, "<html>ok</html>")
    assert looks_blocked(429, "")
    assert looks_blocked(200, "<html><script src='/_Incapsula_Resource?x'></script></html>")
    assert looks_blocked(200, "<title>Robot or human?</title>")
    assert not looks_blocked(200, ld("https://schema.org/InStock"))


def test_keywords_ignore_accents_case_and_order():
    title = "Pokémon TCG: Scarlet & Violet—Prismatic Evolutions Elite Trainer Box"
    assert matches_keywords(title, ["pokemon elite trainer box"], [])
    assert matches_keywords(title, ["ELITE TRAINER BOX POKEMON"], [])
    assert not matches_keywords(title, ["booster bundle"], [])
    assert not matches_keywords(title, ["pokemon"], ["elite trainer"])
    assert matches_keywords("anything", [], [])


def test_find_listings():
    html = """
    <a href="/product/123/pokemon-tcg-prismatic-evolutions-elite-trainer-box?ref=x">
       Pokémon TCG Prismatic Evolutions Elite Trainer Box</a>
    <a href="https://shop.example.com/product/123/pokemon-tcg-prismatic-evolutions-elite-trainer-box">ETB</a>
    <a href="/product/9/pikachu-plush">Pokémon Pikachu Plush Elite Trainer Box Edition</a>
    <a href="https://elsewhere.com/p/1">Pokémon Elite Trainer Box elsewhere</a>
    <a href="/cart">Cart</a>"""
    found = find_listings(html, "https://shop.example.com/category/tcg",
                          ["pokemon elite trainer box"], ["plush"])
    assert found == {
        "https://shop.example.com/product/123/pokemon-tcg-prismatic-evolutions-elite-trainer-box":
            "Pokémon TCG Prismatic Evolutions Elite Trainer Box",
    }
