// Cart
const cartIcon = document.querySelector('#cart-icon')
const cart = document.querySelector('.cart')
const closeCart = document.querySelector('#close-cart')

let temporaryCartItems = []

let cartProductTemplate = {
	name: 'Product Name',
	image: 'Product Image',
	quantity: 0,
	price: 0,
	priceText: '0,00.-'
}

// Open Cart
cartIcon.onclick = () => {
	cart.classList.add('active')
};

// Close Cart
closeCart.onclick = () => {
	cart.classList.remove('active')
}

// Cart Working JS
if (document.readyState == 'loading') {
	document.addEventListener('DOMContentLoaded', onLoad)
} else {
	onLoad();
}

// Making Function
async function onLoad() {
	const cachedCart = JSON.parse(localStorage.getItem('cart')) || []

	// Remove Items From Cart
	const removeCartButtons = document.getElementsByClassName('cart-remove')

	console.log(removeCartButtons.length)

	for (let i = 0; i < removeCartButtons.length; i++) {
		const button = removeCartButtons[i]

		button.addEventListener('click', async () => {
			await removeCartItem()
		})
	}

	// Quantity Changes
	const quantityInputs = document.getElementsByClassName('cart-quantity')

	for (let i = 0; i < quantityInputs.length; i++) {
		const input = quantityInputs[i]

		input.addEventListener('change', async () => {
			await quantityChanged()
		})
	}

	const products = document.querySelectorAll('.product-box')

	for (const product of products) {
		const addProductButton = product.querySelector('.bx.bx-shopping-bag.add-cart') || undefined
		const productName = product.querySelector('.product-title') || undefined
		const productPrice = product.querySelector('.price') || undefined
		const productImage = product.querySelector('.product-img') || undefined

		if (addProductButton && productName && productPrice && productImage) {
			const productQuantity = cachedCart.find((item) => item.name === String(productName)) || 1

			addProductButton.addEventListener('click', async () => {
				await addCartItem(productName, productPrice, productImage, productQuantity)
			})
		}
	}

	if (cachedCart) {
		for (const product of cachedCart) {
			const productName = product.name || undefined
			const productPrice = product.priceText || undefined
			const productImage = product.image || undefined
			const productQuantity = product.quantity || 1

			if (productName && productPrice && productImage && productQuantity) {
				temporaryCartItems.push(product)

				await createCartItem(String(productName), String(productPrice), String(productImage), String(productQuantity))
			}
		}
	}
}

async function countOccurrences(arr, item) {
	let count = 0

	for (let i = 0; i < arr.length; i++) {
		if (arr[i] === item) {
			count++
		}
	}

	return count
}

async function createCartItem(productName, price, productImage, productQuantity) {
	const cartContent = document.querySelector('.cart-content') || undefined

	if (cartContent) {
		const cartBox = document.createElement('div')
		const itemImage = document.createElement('img')
		const detailBox = document.createElement('div')
		const productTitle = document.createElement('div')
		const productPrice = document.createElement('div')
		const itemQuantity = document.createElement('input')
		const removeCartComment = document.createComment('Remove Cart')
		const removeItemIcon = document.createElement('i')
	
		cartBox.className = 'cart-box'
		itemImage.className = 'cart-img'
		itemImage.src = String(productImage)
		detailBox.className = 'detail-box'
		productTitle.className = 'cart-product-title'
		productTitle.innerText = String(productName)
		productPrice.className = 'cart-price'
		productPrice.innerText = String(price)
		itemQuantity.className = 'cart-quantity'
		itemQuantity.type = 'number'
		itemQuantity.min = '1'
		itemQuantity.max = '50'
		itemQuantity.value = String(productQuantity)
		removeItemIcon.className = 'bx bxs-trash cart-remove'
	
		cartBox.appendChild(itemImage)
		cartBox.appendChild(detailBox)
		detailBox.appendChild(productTitle)
		detailBox.appendChild(productPrice)
		detailBox.appendChild(itemQuantity)
		cartBox.appendChild(removeCartComment)
		cartBox.appendChild(removeItemIcon)
	
		itemQuantity.addEventListener('change', async () => {
			await quantityChanged(itemQuantity)
		})
	
		removeItemIcon.addEventListener('click', async () => {
			await removeCartItem(removeItemIcon)
		})
	
		cartContent.appendChild(cartBox)

		await updatetotal()
	}
}

async function addCartItem(productName, productPrice, productImage, productQuantity) {
	const cartLS = JSON.parse(localStorage.getItem('cart')) || []
	const cartContent = document.querySelector('.cart-content') || undefined
	const productText = productName.innerText || undefined
	const price = productPrice.innerText || undefined
	const image = productImage.src || undefined
	const quantity = productQuantity || undefined

	if (cartContent && productText && price && image && quantity && !cartLS.find((item) => item.name === String(productText))) {
		await createCartItem(String(productText), String(price), String(image), String(quantity))

		if (cart && !cart.classList.contains('active')) {
			cart.classList.add('active')
		}

		cartProductTemplate.name = String(productText)
		cartProductTemplate.image = String(image)
		cartProductTemplate.quantity = parseInt(quantity)
		cartProductTemplate.price = parseFloat(String(price).replace(',', '.').replace('.-', ''))
		cartProductTemplate.priceText = String(price)
		
		temporaryCartItems.push(cartProductTemplate)
		localStorage.setItem('cart', JSON.stringify(temporaryCartItems))
		
		console.log(String(productName.innerText))
	} else if (cartLS.find((item) => item.name === String(productText))) {
		const itemToUpdate = cartLS.find((item) => item.name === String(productText))

		console.log('theres a product that already has quantity')
		
		if (cartContent && cartContent.children) {
			if (itemToUpdate.quantity) {
				if (itemToUpdate.name && itemToUpdate.price && itemToUpdate.image && itemToUpdate.quantity) {
					for (const product of cartContent.children) {
						console.log(product.querySelector('.detail-box').querySelector('.cart-product-title').textContent)

						if (product.className && String(product.className) === 'cart-box' && product.querySelector('.detail-box').querySelector('.cart-product-title') && String(product.querySelector('.detail-box').querySelector('.cart-product-title').textContent) === String(itemToUpdate.name)) {
							await removeCartItem(product)
						}
					}

					if (parseInt(itemToUpdate.quantity) && !isNaN(parseInt(itemToUpdate.quantity))) {
						await createCartItem(String(itemToUpdate.name), String(itemToUpdate.price), String(itemToUpdate.image), String(parseInt(parseInt(itemToUpdate.quantity) + 1)))
					}
				}
			}
		}

		await updatetotal()
	}
}

// Reomve Items From Cart
async function removeCartItem(element) {
	const buttonClicked = element
	const productTitle = element.parentElement.querySelector('.cart-product-title') || undefined

	buttonClicked.parentElement.remove()

	const newCart = temporaryCartItems.filter((item) => String(item?.name) !== String(productTitle))

	localStorage.setItem('cart', JSON.stringify(newCart))

	await updatetotal()
}

// Quantity Changes
async function quantityChanged(input) {
	if (input.value && isNaN(input.value) || input.value <= 0) {
		input.value = 1
	}

	await updatetotal()
}

// Update Total
async function updatetotal() {
	const cartContent = document.getElementsByClassName('cart-content')[0] || undefined
	const cartBoxes = cartContent.getElementsByClassName('cart-box') || undefined

	let total = 0
	
	if (cartContent && cartBoxes) {
		for (let i = 0; i < cartBoxes.length; i++) {
			const cartBox = cartBoxes[i] || undefined
			const priceElement = cartBox.getElementsByClassName('cart-price')[0] || undefined
			const quantityElement = cartBox.getElementsByClassName('cart-quantity')[0] || undefined
			const price = parseFloat(priceElement?.innerText.replace('.-', '')) || undefined
			const quantity = quantityElement?.value || undefined
	
			if (cartBox && priceElement && quantityElement && price && quantity) {
				total = total + (price * quantity)
	
				if (document.getElementsByClassName('total-price')) {
					document.getElementsByClassName('total-price')[0].innerText = `${String(total)} CZK`
				}
			}
		}
	} else {
		if (document.getElementsByClassName('total-price')) {
			document.getElementsByClassName('total-price')[0].innerText = `0 CZK`
		}
	}
}