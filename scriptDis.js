const addFormPattern = `<div class="passenger-form">
  <input type="text" class="textField passenger-form__textField" name="passenger-name"
    placeholder="Passenger's name">
  <input type="number" class="numberField passenger-form__numberField" name="passenger-weight" min="50"
    value="50">
  <button type="button" class="button button_remove">Remove</button>
</div>`

const form = document.getElementById('form')
const popup = {
  base: document.getElementById('popup'),
  container: document.getElementById('popup__container'),
  sum: document.getElementById('popup__sum'),
  currency: document.getElementById('popup__currency'),
}
const prices = {
  baseTicket: 20000,
  additional: 8000,
  perKg: 100,
  perLb: 100 / 2.20462,
}
const fieldsets = {
  applicant: document.querySelector('.fieldset_applicant'),
  params: document.querySelector('.fieldset_params'),
  passengers: document.querySelector('.fieldset_passengers'),
  submit: document.querySelector('.fieldset_submit'),
}
const applicantFields = {
  name: document.getElementById('applicant-name'),
  surname: document.getElementById('applicant-surname'),
  email: document.getElementById('applicant-email'),
  citizenship: document.getElementById('citizenship'),
  motivation: document.getElementById('motivation'),
}
const params = {
  massUnit: document.querySelectorAll('.switcher__radio'),
  currency: document.getElementById('currency'),
}
const addButton = document.getElementById('add')
const submitButton = document.getElementById('submit')
const massSwitcher = document.getElementById('mass-switcher')

//Filling default passenger as Applicant
function fillApplicantAsPassenger() {
  const textField = document.getElementById('passenger-applicant')
  textField.value = `${applicantFields.surname.value} ${applicantFields.name.value}`
}
applicantFields.name.addEventListener('input', fillApplicantAsPassenger)
applicantFields.surname.addEventListener('input', fillApplicantAsPassenger)

// Adding Passengers
function addPassenger() {
  const massUnit = document.querySelector('input[name="mass-unit"]:checked').value
  const minWeight = massUnit === 'lb' ? '110' : '50'
  const defaultValue = minWeight
  const updatedFormPattern = addFormPattern
    .replace('min="50"', `min="${minWeight}"`)
    .replace('value="50"', `value="${defaultValue}"`)
  addButton.insertAdjacentHTML('beforeBegin', updatedFormPattern)
}
addButton.addEventListener('click', addPassenger)

function removePassenger(e) {
  const t = e.target.closest('.button_remove')
  if (!t) return
  t.closest('.passenger-form').remove()
}
fieldsets.passengers.addEventListener('click', removePassenger)

//Weight works
function getTotalWeight() {
  const passengers = document.querySelectorAll('.passenger-form__numberField')
  const total = Array.from(passengers).reduce((acc, item) => acc += parseInt(item.value), 0)
  return total
}

function checkTotalWeight() {
  const massUnit = document.querySelector('input[name="mass-unit"]:checked').value
  const total = getTotalWeight()

  if (massUnit === 'kg') {
    return total <= 300
  } else {
    const maxWeightInLB = 300 * 2.20462
    return total < maxWeightInLB
  }
}

function disableButtons() {
  addButton.disabled = submitButton.disabled = true
}

function enableButtons() {
  addButton.disabled = submitButton.disabled = false
}

addButton.addEventListener('click', () => {
  if (getTotalWeight() + 50 > 300) {
    disableButtons()
  } else {
    enableButtons()
  }
})

addButton.addEventListener('click', () => {
  if (!checkTotalWeight()) {
    disableButtons()
  } else {
    enableButtons()
  }
})

fieldsets.passengers.addEventListener('input', e => {
  const t = e.target.closest('.passenger-form__numberField')
  if (!t) return

  const massUnit = document.querySelector('input[name="mass-unit"]:checked').value
  const total = getTotalWeight()

  if (massUnit === 'kg') {
    if (total > 300) {
      disableButtons()
    } else {
      enableButtons()
    }
  } else {
    const maxWeightInLB = 300 * 2.20462
    if (total >= maxWeightInLB) {
      disableButtons()
    } else {
      enableButtons()
    }
  }
})

fieldsets.passengers.addEventListener('click', () => {
  if (getTotalWeight() - 50 < 300) {
    enableButtons()
  }
})

function updateMassAttributes() {
  const massUnit = document.querySelector('input[name="mass-unit"]:checked').value
  const passengers = document.querySelectorAll('.passenger-form__numberField')
  passengers.forEach(passenger => {
    if (massUnit === 'lb') {
      passenger.setAttribute('min', '110')
      passenger.setAttribute('value', '110')
    } else {
      passenger.setAttribute('min', '50')
      passenger.setAttribute('value', '50')
    }
  })
}

params.massUnit.forEach(unit => {
  unit.addEventListener('change', updateMassAttributes)
})


//Price
function getTotalPrice() {
  const massUnit = document.querySelector('input[name="mass-unit"]:checked').value
  let res = prices.baseTicket
  const additionalCount = fieldsets.passengers.querySelectorAll('.passenger-form').length - 1
  const additionalPrice = additionalCount * prices.additional
  res += additionalPrice
  if (massUnit == 'kg') {
    const applicantWeight = document.querySelector('#passenger-applicant').nextElementSibling.value
    const additionalWeights = getTotalWeight() - parseInt(applicantWeight) - (50 * additionalCount)
    res += (additionalWeights * prices.perKg)
  } else {
    const applicantWeight = document.querySelector('#passenger-applicant').nextElementSibling.value
    const additionalWeights = getTotalWeight() - parseInt(applicantWeight) - (110 * additionalCount)
    res += (additionalWeights * prices.perLb)
  }
  return parseFloat(res.toFixed(2))
}
async function showTotalPrice() {
  const exchanged = await exchangeMoney()
  submitButton.setAttribute('value', `Submit: ${exchanged}${params.currency.value}`)
  popup.sum.textContent = exchanged
  popup.currency.textContent = params.currency.value
}
showTotalPrice()

addButton.addEventListener('click', showTotalPrice)
fieldsets.passengers.addEventListener('input', e => {
  const t = e.target.closest('.passenger-form__numberField')
  if (!t) return
  showTotalPrice()
})
fieldsets.passengers.addEventListener('click', e => {
  const t = e.target.closest('.button_remove')
  if (!t) return
  showTotalPrice()
})
massSwitcher.addEventListener('click', showTotalPrice)

async function exchangeMoney(sum) {
  try {
    const currency = params.currency.value
    const response = await fetch(`https://v6.exchangerate-api.com/v6/ff696cf3d6cf84b4fac89f79/pair/eur/${currency}`)
    const json = await response.json()
    if (json.result == 'error') throw new Error(json["error-type"])
    const ratio = json['conversion_rate']
    const exchanged = parseFloat((getTotalPrice() * ratio).toFixed(2))
    return exchanged
  } catch (e) {
    console.log(e)
  }
}
params.currency.addEventListener('change', showTotalPrice)

//submit
function preventSubmit(e) {
  e.preventDefault()
}

function showPopup() {
  document.body.style.overflow = 'hidden'
  popup.base.style.display = 'flex'
}
function hidePopup() {
  document.body.style.overflow = ''
  popup.base.style.display = 'none'
}
popup.base.addEventListener('click', hidePopup)
popup.container.addEventListener('click', e => e.stopPropagation())

function getData() {
  const data = {
    applicant: {
      name: document.getElementById('applicant-name').value,
      surname: document.getElementById('applicant-surname').value,
      email: document.getElementById('applicant-email').value,
      citizenship: document.getElementById('citizenship').value,
      motivation: document.getElementById('motivation').value,
    },
    passengers: [],
  }
  const passengers = Array.from(fieldsets.passengers.querySelectorAll('.passenger-form')).slice(1)
  passengers.forEach(passenger => {
    data.passengers.push({
      name: passenger.querySelector('.textField').value,
      weight: passenger.querySelector('.numberField').value,
    })
  })
  return data
}
function validateForms(data) {
  if (!data.applicant.name || !data.applicant.surname || !data.applicant.email || !data.applicant.citizenship || !data.applicant.motivation) {
    return false
  }
  if (data.passengers.length === 0) {
    return false
  }
  for (let passenger of data.passengers) {
    if (!passenger.name || !passenger.weight) {
      return false
    }
  }
  return true
}
function submitHandler(e) {
  e.preventDefault()
  const data = getData()
  if (!validateForms(data)) {
    alert('Поля должны быть заполнены')
    return
  }
  console.log(data)
  showPopup()
}
submitButton.addEventListener('submit', preventSubmit)
submitButton.addEventListener('click', submitHandler)