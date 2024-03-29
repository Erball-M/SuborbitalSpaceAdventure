//Consts
const lbPerKg = 2.20462
const prices = {
  baseTicket: 20000,
  additional: 8000,
  perKg: 100,
  perLb: 100 / lbPerKg,
}
const maxPassengersByTicket = 5
const maxWeightByTicketInKg = 300

//Nodes
const form = document.getElementById('form')
const fieldsetParams = form.elements.params
const fieldsetSubmit = form.elements.submit
const fieldsetTickets = form.elements.tickets
const popup = {
  base: document.getElementById('popup'),
  container: document.getElementById('popup__container'),
  sum: document.getElementById('popup__sum'),
  currency: document.getElementById('popup__currency'),
}

//Select
const currency = document.getElementById('currency')

//Buttons
const massSwitcher = document.getElementById('massSwitcher')
const submitButton = document.getElementById('submit')
const addTicketButton = document.getElementById('addTicket')

//Utils
function getSelectedRadio(nodes) {
  const arr = !Array.isArray(nodes) ? Array.from(nodes) : nodes
  const selected = arr.find(item => item.checked)
  return selected.value
}

//Params Fields
function getParamsData() {
  const paramsData = {
    massUnit: getSelectedMassUnit(),
    currency: fieldsetParams.elements.currency.value,
  }
  return paramsData
}

//Weight
function getSelectedMassUnit() {
  const selected = getSelectedRadio(fieldsetParams.querySelectorAll('[name=massUnit]'))
  return selected
}
function updateKgData(e) {
  const t = e.target.closest('.passenger-form__numberField')
  if (!t) return
  const massUnit = getSelectedMassUnit()
  if (massUnit === 'kg') {
    t.dataset.kgValue = t.value
  } else if (massUnit === 'lb') {
    t.dataset.kgValue = parseFloat((t.value / lbPerKg).toFixed(2))
  }
  showFullPrice()
}

//Tickets
function getTicketsCount() {
  const count = document.querySelectorAll('.fieldset_ticket').length
  return count
}
function ticketInit(ticketNode) {
  const fieldsetApplicant = ticketNode.querySelector('.fieldset_applicant')
  const fieldsetPassengers = ticketNode.querySelector('.fieldset_passengers')
  const addButton = ticketNode.querySelector('.button_add')

  function disableButton() {
    addButton.disabled = true
  }
  function enableButton() {
    addButton.disabled = false
  }

  //Applicant Fields
  function getApplicantData() {
    const applicantData = {
      name: ticketNode.querySelector('.applicant__name').value,
      surname: ticketNode.querySelector('.applicant__surname').value,
      email: ticketNode.querySelector('.applicant__email').value,
      citizenship: ticketNode.querySelector('.applicant__citizenship').value,
      motivation: ticketNode.querySelector('.applicant__motivation').value,
    }
    return applicantData
  }
  function getApplicantFullname() {
    const applicantData = getApplicantData()
    return `${applicantData.name} ${applicantData.surname}`
  }

  //Passengers Fields
  function getPassengers() {
    const nodes = ticketNode.querySelectorAll('.passenger-form')
    return nodes
  }
  function getPassengersData() {
    const passengersData = []
    const forms = getPassengers()
    for (let passenger of forms) {
      const data = {
        name: passenger.querySelector('.passenger-form__textField').value,
        weight: passenger.querySelector('.passenger-form__numberField').value,
      }
      passengersData.push(data)
    }
    return passengersData
  }
  function fillApplicantField() {
    const fullName = getApplicantFullname()
    const applicantAsPassengerField = ticketNode.querySelector('.passenger-form:first-of-type [name=passenger-name]')
    applicantAsPassengerField.value = fullName
  }
  function addPassenger() {
    const isMay = checkWeightIfAdd()
    if (!isMay) {
      disableButton()
      return
    }
    const massUnit = getSelectedMassUnit()
    const defaultValue = massUnit === 'kg' ? 50 : 50 * lbPerKg
    const defaultKgValue = 50
    const addPassengerPattern = `
      <div class="passenger-form">
      <input type="text" class="textField passenger-form__textField" name="passenger-name"placeholder="Passenger's name">
      <input type="number" class="numberField passenger-form__numberField" name="passengerWeight" min="50" value="${defaultValue}" data-kg-value="${defaultKgValue}">
      <button type="button" class="button button_remove">Remove</button>
      </div>`
    const lastPassenger = ticketNode.querySelector('.passenger-form:last-of-type')
    lastPassenger.insertAdjacentHTML('afterEnd', addPassengerPattern)

    if (!checkPassengerCount()) {
      disableButton()
    }
  }
  function removePassenger(e) {
    const isMay = checkWeightIfAdd()
    if (isMay) {
      enableButton()
    }
    const t = e.target.closest('.button_remove')
    if (!t) return
    t.closest('.passenger-form').remove()

    if (checkPassengerCount()) {
      enableButton()
    }
    showFullPrice()
  }
  function checkPassengerCount() {
    const result = getPassengers().length < maxPassengersByTicket
    return result
  }

  ticketNode.querySelector('.applicant__name').addEventListener('input', fillApplicantField)
  ticketNode.querySelector('.applicant__surname').addEventListener('input', fillApplicantField)
  addButton.addEventListener('click', addPassenger)
  addButton.addEventListener('click', invalidHandler)
  addButton.addEventListener('click', showFullPrice)
  fieldsetPassengers.addEventListener('click', removePassenger) //делегирование

  //Weight
  function getApplicantWeight() {
    const applicantWeightField = ticketNode.querySelector('.passenger-form:first-of-type [name=passengerWeight]')
    const applicantWeight = parseFloat(applicantWeightField.dataset.kgValue)
    return applicantWeight
  }
  function getTotalWeightInKg() {
    let totalWeight = 0
    const passengers = getPassengers()
    passengers.forEach(passenger => {
      const weightField = passenger.querySelector('.passenger-form__numberField')
      totalWeight += parseFloat(weightField.dataset.kgValue)
    })
    return totalWeight
  }
  function changeMassUnit(e) {
    const t = e.target.closest('.switcher__radio')
    if (!t) return
    const massUnit = t.value
    const passengers = getPassengers()
    passengers.forEach(passenger => {
      const weightField = passenger.querySelector('.passenger-form__numberField')
      if (massUnit === 'kg') {
        weightField.value = parseFloat(weightField.dataset.kgValue)
      } else if (massUnit === 'lb') {
        weightField.value = parseFloat(weightField.dataset.kgValue) * lbPerKg
      }
    })
  }
  function checkWeight() {
    const massUnit = getSelectedMassUnit()
    const totalWeight = getTotalWeightInKg()
    const weightInKg = massUnit === 'kg' ? totalWeight : (totalWeight * lbPerKg)
    const isOkay = weightInKg <= maxWeightByTicketInKg
    return isOkay
  }
  function checkWeightHandler(e) {
    const isMay = checkWeightIfAdd()
    if (!isMay) {
      disableButton()
      return
    }

    const t = e.target.closest('.passenger-form__numberField')
    if (!t) return
    const isOkay = checkWeight()
    if (isOkay) {
      enableButton()
    } else {
      disableButton()
    }
  }
  function checkWeightIfAdd() {
    const totalWeight = getTotalWeightInKg()
    const isOkay = totalWeight + 50 < maxWeightByTicketInKg
    return isOkay
  }

  fieldsetPassengers.addEventListener('input', updateKgData)//делегирование
  // fieldsetPassengers.addEventListener('input', updatePriceByKg)//делегирование
  fieldsetPassengers.addEventListener('input', checkWeightHandler)//делегирование
  massSwitcher.addEventListener('change', changeMassUnit)//делегирование

  //Return ticket methods
  const ticketMethods = {
    getApplicantWeight,
    getApplicantData,
    getPassengers,
    getPassengersData,
    getTotalWeightInKg,
    disableButton,
    enableButton,
    checkWeight,
    checkPassengerCount,
  }
  return ticketMethods
}
function addTicket() {
  const ticketNumber = getTicketsCount() + 1
  const massUnit = getSelectedMassUnit()
  const defaultValue = massUnit === 'kg' ? 50 : 50 * lbPerKg
  const defaultKgValue = 50
  const additionalTicketPattern = `
    <fieldset class="fieldset fieldset_ticket ticket-${ticketNumber}">
    <h2 class="ticket-number">Ticket ${ticketNumber}</h2>
    <fieldset class="fieldset fieldset_applicant applicant">
    <input type="text" class="textField applicant__name" name="name" placeholder="Name">
    <input type="text" class="textField applicant__surname" name="surname" placeholder="Surname">
    <input type="text" class="textField applicant__email" name="email" placeholder="Email">
    <select name="citizenship" class="select applicant__citizenship">
    <option value="american">American</option>
    <option value="belarusian">Belarusian</option>
    <option value="belgian">Belgian</option>
    <option value="brazilian">Brazilian</option>
    <option value="british">British</option>
    <option value="canadian">Canadian</option>
    <option value="chinese">Chinese</option>
    <option value="czech">Czech</option>
    <option value="french">French</option>
    <option value="georgian">Georgian</option>
    <option value="german">German</option>
    <option value="indian">Indian</option>
    <option value="israeli">Israeli</option>
    <option value="italian">Italian</option>
    <option value="japanese">Japanese</option>
    <option value="kazakhstani">Kazakhstani</option>
    <option value="kyrgyz">Kyrgyz</option>
    <option value="mexican">Mexican</option>
    <option value="moldovan">Moldovan</option>
    <option value="polish">Polish</option>
    <option value="russian">Russian</option>
    <option value="south korean">South Korean</option>
    <option value="spanish">Spanish</option>
    <option value="swedish">Swedish</option>
    <option value="tajik">Tajik</option>
    <option value="ukrainian">Ukrainian</option>
    <option value="uzbekistani">Uzbekistani</option>
    </select>
    <textarea name="motivation" class="textField applicant__motivation" rows="15"
    placeholder="Motivation"></textarea>
    </fieldset>
    <fieldset class="fieldset fieldset_passengers">
    <div class="passenger-form">
    <input type="text" class="textField passenger-form__textField passenger-applicant" disabled
    name="passenger-name" placeholder="Applcant's name" id="passenger-applicant">
    <input type="number" class="numberField passenger-form__numberField" name="passengerWeight" min="50"
    value="${defaultValue}" data-kg-value="${defaultKgValue}">
    </div>
    <button type="button" class="button button_add" id="add">Add passenger</button>
    </fieldset>`
  fieldsetTickets.insertAdjacentHTML('beforebegin', additionalTicketPattern)
  const newTicket = document.querySelector(`.ticket-${ticketNumber}`)

  const ticketMethods = ticketInit(newTicket)
  tickets[ticketNumber] = ticketMethods
}

const ticket_1 = document.querySelector('.fieldset_ticket')
const tickets = { 1: ticketInit(ticket_1) }

addTicketButton.addEventListener('click', addTicket)
addTicketButton.addEventListener('click', invalidHandler)

//Price
function getBasePrice() {
  const ticketsCount = getTicketsCount()
  const totalPrice = ticketsCount * prices.baseTicket
  return totalPrice
}
function getPassengersPrice() {
  let passengersCount = 0
  const applicantsCount = getTicketsCount()
  for (let key in tickets) {
    passengersCount += tickets[key].getPassengers().length
  }
  const basePricePerPassenger = (passengersCount - applicantsCount) * prices.additional
  return basePricePerPassenger
}
function getPassengersAdditionalPrice() {
  let totalWeight = 0
  let passengersCount = 0
  let applicantsAdditionalWeights = 0
  const massUnit = getSelectedMassUnit()
  for (let key in tickets) {
    passengersCount += tickets[key].getPassengers().length
    const weightInKg = tickets[key].getTotalWeightInKg()
    totalWeight += weightInKg
    const applicantsWeight = tickets[key].getApplicantWeight()
    applicantsAdditionalWeights += (applicantsWeight - 50)
  }
  const additionalWeight = totalWeight - (passengersCount * 50) - applicantsAdditionalWeights
  let price = 0
  if (massUnit === 'kg') {
    price += prices.perKg * additionalWeight
  } else if (massUnit === 'lb') {
    price += prices.perLb * additionalWeight
  }
  return price
}
function getTotalPrice() {
  const result = getBasePrice() + getPassengersPrice() + getPassengersAdditionalPrice()
  return result
}
async function exchangePrice() {
  const totalPriceInEur = getTotalPrice()
  try {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/ff696cf3d6cf84b4fac89f79/pair/eur/${currency.value}`)
    const json = await response.json()
    if (json.result == 'error') throw new Error(json["error-type"])
    const ratio = json['conversion_rate']
    const exchanged = parseFloat((totalPriceInEur * ratio).toFixed(2))
    return exchanged
  } catch (err) {
    console.log(err)
    return 'Error exhcnaged'
  }
}
function showCurrency() {
  const currencyField = document.getElementById('currency-field')
  currencyField.textContent = currency.value
}
async function showPrice() {
  const priceField = document.getElementById('totalPrice-field')
  const totalPrice = await exchangePrice()
  priceField.textContent = totalPrice
}
function showFullPrice() {
  showCurrency()
  showPrice()
}

currency.addEventListener('change', showFullPrice)

//Popup
async function showPopup() {
  popup.currency.textContent = currency.value
  const exchangedPrice = await exchangePrice()
  popup.sum.textContent = exchangedPrice
  popup.base.style.display = 'flex'
}
function hidePopup() {
  popup.base.style.display = 'none'
}

popup.base.addEventListener('click', hidePopup)
popup.container.addEventListener('click', e => e.stopPropagation())

//Validate
function invalidFields() {
  const textFields = form.querySelectorAll('input[type=text]')
  for (let field of textFields) {
    if (!field.value.trim().length) {
      field.classList.add('invalid-field')
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const emailFields = form.querySelectorAll('input[type=email]')
  for (let field of emailFields) {
    const isEmail = emailRegex.test(field.value.trim())
    if (!isEmail) {
      field.classList.add('invalid-field')
    }
  }

  const numberFields = form.querySelectorAll('input[type=number]')
  for (let field of numberFields) {
    const float = parseFloat(field.value.trim())
    if (isNaN(float)) {
      field.classList.add('invalid-field')
    }
  }
}
function focusInvalid(e) {
  const t = e.target
  t.classList.remove('invalid-field')
}
function validateFields() {
  const textFields = form.querySelectorAll('input[type=text]')
  for (let field of textFields) {
    if (!field.value.trim().length) {
      return false
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const emailFields = form.querySelectorAll('input[type=email]')
  for (let field of emailFields) {
    const isEmail = emailRegex.test(field.value.trim())
    if (!isEmail) {
      return false;
    }
  }

  const numberFields = form.querySelectorAll('input[type=number]')
  for (let field of numberFields) {
    const float = parseFloat(field.value.trim())
    if (isNaN(float)) {
      return false
    }
  }

  return true
}
function invalidHandler() {
  form.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', focusInvalid)
  })
}

invalidHandler()

//Submit
async function getFullData() {
  const result = {
    params: getParamsData(),
    price: 0,
    tickets: [],
  }

  result.price = await exchangePrice()

  for (let key in tickets) {
    const data = {
      applicantData: tickets[key].getApplicantData(),
      passengersData: tickets[key].getPassengersData(),
    }
    result.tickets.push(data)
  }

  return result
}
async function logFullData() {
  const fullData = await getFullData()
  const json = JSON.stringify(fullData)
  console.log(json)
}
function submitHandler(e) {
  e.preventDefault()
  const isValid = validateFields()
  if (isValid) {
    logFullData()
    showPopup()
  } else {
    invalidFields()
  }
}

submitButton.addEventListener('click', submitHandler)