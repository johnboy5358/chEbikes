;(function () {

  // Helper functions
  // A curried map function.
  // map : fn -> [a, ...] -> [b, ...]
  const map = fn => coll => Array.prototype.map.call(coll, fn)
  // a regex helper function.
  const regExTest = targetStr => regex => RegExp.prototype.test.call(regex,targetStr)

  // Fetching bike data from local assets/data dir.
  const bikeData = fetch('assets/data/bikeData.json')
  const bikeJsonProm = bikeData
    .then(response => response.json())
    .catch((response) => {
      console.log("Opps! something went wrong!", response)
      return {bikeData: []}
  })

  /*
  * MAIN CONTENT
  *
  */

 // Reference to the #main-content element on the front page.
  const domMainContent = document.getElementById('main-content')
  domMainContent.style.display = 'grid'

  // Use articleTemplate
  // mappedAreticle : [{}, ...] -> [String, ...]
  const mappedArticle = map(articleTemplate)

  // Initialise the DOM; put bike data in the DOM || a message if something went wrong.
  bikeJsonProm.then(json => {
    domMainContent.innerHTML = (json.bikeData.length === 0)
      ? `<h1 class="alert">Opps, something went wrong!<span> could not get bike data.</span></h1>`
      : mappedArticle(json.bikeData).join('')
  })

  /*
    * SHOPPING BASKET
    * Stuff to do with the shopping basket
  */

  // basket and cart are used to mean the same thing.
  const domBasket = {
    // reference to basket icon in the main-header.
    'icon': document.getElementById('basket-icon'),
    // reference to number of items in basket.
    'item-count': document.getElementById('basket-items'),
    // reference to basket icon total.
    'total': document.getElementById('basket-total'),
    // reference to the contents of the basket when displayed by clicking icon.
    'content': document.getElementById('basket-content')
  }

  // basket model initialised to empty.
  const basket = {
    items: []
  }

  /*
    * Event Listeners.
  */

  // Front page, #main-content listener to captue any message types.
  domMainContent.addEventListener('click', e => {
    const matchId = regExTest(e.target.id)
    switch (true) {
      // listen for add button clicks.
      case matchId(/add#/):
        const bikeId = e.target.id.match(/add#(\w*)$/)[1]
        bikeJsonProm.then((data) => {
          basket.items.push(data.bikeData.filter(bike => bike.id === bikeId)[0])
          domBasket['item-count'].innerText = basket.items.length
          domBasket['total'].innerText = Math.round(basket.items.reduce((p,c) => p+c.price[0], 0) *100) / 100
        })
        break;
      default:
        console.log('NoOp');
    }
  })

  domBasket.content.addEventListener('click', e => {
    const id = e.target.id
    const matchId = regExTest(id)
    const matchContinueShopping = matchId(/continue-shopping/)
    const matchRemove = matchId(/remove#([a-z]{2}\d{4})/)
    switch (true) {
      case matchContinueShopping:
        console.log("Close basket and show front-page again.")
        domMainContent.style.display = 'grid'
        domBasket.content.style.display = 'none'
        break;
      case matchRemove:
        const bikeId = id.match(/[a-z]{2}\d{4}/)[0]
        const result = basket.items.filter(bike => bike.id !== bikeId)
        basket.items = result
        domBasket['item-count'].innerText = result.length
        domBasket['total'].innerText = Math.round(result.reduce((p,c) => p+c.price[0], 0) *100) / 100
        document.getElementById(bikeId).remove()
        break;
      default:
        console.log("NoOp")
        break;
    }
  })

  // listen for clicks on the main-header.
  domBasket.icon.addEventListener('click', e => {
    const matchId = regExTest(e.target.id)
    switch (true) {
      case matchId(/basket-i/):
        console.log("You want to see what is in the basket")
        showBasket(e)
        break;
      default:
        console.log("NoOp")
    }
  })

  /*
    * VIEW FUNCTIONS *
  */
  function articleTemplate(bDat) {
    return (`
    <article class="bike-summary">
      <img src="${bDat.imgsrc}" alt="bike image">
      <div class="bike-details">
        <p class="price">
          £${(bDat.price.length === 1) ? String(bDat.price[0]) : String(bDat.price[0]) + ' - ' + bDat.price[bDat.price.length-1]}
          <button id="add#${bDat.id}" class="add-to-cart">Add to cart</button>
        </p>
        <h3>${bDat.hdg}</h3>
        <p class="in-brief">
          ${bDat.brieftxt}
          <a class="more"> more</a>
        </p>
      </div>
    </article>
    `)
  }

  function showBasket(e) {
    console.log(e.target.id)
    domMainContent.style.display = 'none'
    domBasket.content.style.display = 'grid'
    domBasket.content.innerHTML =
    `
      <h2>Your basket:</h2>
      <table>
        <tbody>
          ${basket.items.map((v, i) => {
            return (`
              <tr id="${v.id}">
                <td><img src=${v.imgsrc} /></td>
                <td>${v.hdg}</td>
                <td>${v.price.length > 1 ? (`£${v.price[0]} - £${v.price[v.price.length-1]}`) : (`£${v.price[0]}`)}</td>
                <td><button id="remove#${v.id}" class="remove">Remove</button></td>
              </tr>
            `)}).join('')}
        </tbody>
      </table>

      <div>
        <button id="continue-shopping">Continue shopping</button>
        <button id="checkout">Check out</button>
      </div>
    `
  }

}())
