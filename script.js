//Consts
const lbPerKg = 2.20462
const prices = {
  baseTicket: 20000,
  additional: 8000,
  perKg: 100,
  perLb: 100 / lbPerKg,
}

//Nodes
const form = document.getElementById('form')
const fieldsetApplicant = form.elements.applicant
const fieldsetParams = form.elements.params
const fieldsetPassengers = form.elements.passengers
const fieldsetSubmit = form.elements.submit
const fieldsetTickets = form.elements.tickets
const popup = {
  base: document.getElementById('popup'),
  container: document.getElementById('popup__container'),
  sum: document.getElementById('popup__sum'),
  currency: document.getElementById('popup__currency'),
}
const massSwitcher = document.getElementById('massSwitcher')

//Buttons
const addButton = document.getElementById('add')
const submitButton = document.getElementById('submit')
const addTicketButton = document.getElementById('addTicket')

function disableButton() {
  addButton.disabled = submitButton.disabled = true
}
function enableButton() {
  addButton.disabled = submitButton.disabled = false
}

//Utils
function getSelectedRadio(nodes) {
  const arr = !Array.isArray(nodes) ? Array.from(nodes) : nodes
  const selected = arr.find(item => item.checked)
  return selected.value
}
function getApplicantFullname() {
  const applicantData = getApplicantData()
  return `${applicantData.name} ${applicantData.surname}`
}

//Applicant Fields
function getApplicantData() {
  const applicantData = {
    name: fieldsetApplicant.elements.name.value,
    surname: fieldsetApplicant.elements.surname.value,
    email: fieldsetApplicant.elements.email.value,
    citizenship: fieldsetApplicant.elements.citizenship.value,
    motivation: fieldsetApplicant.elements.motivation.value,
  }
  return applicantData
}

//Params Fields
function getParamsData() {
  const paramsData = {
    massUnit: getSelectedMassUnit(),
    currency: fieldsetParams.elements.currency.value,
  }
  return paramsData
}

//Passengers Fields
function getPassengers() {
  const nodes = fieldsetPassengers.querySelectorAll('.passenger-form')
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
  const applicantAsPassengerField = document.querySelector('.passenger-form:first-of-type [name=passenger-name]')
  applicantAsPassengerField.value = fullName
}
function addPassenger() {
  const massUnit = getSelectedMassUnit()
  const defaultValue = massUnit === 'kg' ? 50 : 50 * lbPerKg
  const defaultKgValue = 50
  const addPassengerPattern = `
  <div class="passenger-form">
  <input type="text" class="textField passenger-form__textField" name="passenger-name"placeholder="Passenger's name">
  <input type="number" class="numberField passenger-form__numberField" name="passengerWeight" min="50" value="${defaultValue}" data-kg-value="${defaultKgValue}">
  <button type="button" class="button button_remove">Remove</button>
  </div>`
  const lastPassenger = document.querySelector('.passenger-form:last-of-type')
  lastPassenger.insertAdjacentHTML('afterEnd', addPassengerPattern)
}
function removePassenger(e) {
  const t = e.target.closest('.button_remove')
  if (!t) return
  t.closest('.passenger-form').remove()
}

fieldsetApplicant.elements.name.addEventListener('input', fillApplicantField)
fieldsetApplicant.elements.surname.addEventListener('input', fillApplicantField)
addButton.addEventListener('click', addPassenger)
fieldsetPassengers.addEventListener('click', removePassenger) //делегирование

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

fieldsetPassengers.addEventListener('input', updateKgData)//делегирование
massSwitcher.addEventListener('change', changeMassUnit)//делегирование

//Price

//Popup
function showPopup() {
  popup.base.style.display = 'flex'
}
function hidePopup() {
  popup.base.style.display = 'none'
}

popup.base.addEventListener('click', hidePopup)
popup.container.addEventListener('click', e => e.stopPropagation())

//Tickets
function getTicketsCount() {
  const count = document.querySelectorAll('.fieldset_ticket').length
  return count
}
function addTicket() {
  const ticketNumber = getTicketsCount() + 1
  const additionalTicketPattern = `
  <fieldset class="fieldset fieldset_ticket">
  <h2 class="ticket-number">Ticket ${ticketNumber}</h2>
  <fieldset class="fieldset fieldset_applicant" name="applicant">
  <input type="text" class="textField" name="name" placeholder="Name">
  <input type="text" class="textField" name="surname" placeholder="Surname">
  <input type="text" class="textField" name="email" placeholder="Email">
  </select>
  <textarea name="motivation" class="textField" rows="15" placeholder="Motivation"></textarea>
  </fieldset>
  <fieldset class="fieldset fieldset_passengers" name="passengers">
  <div class="passenger-form">
  <input type="text" class="textField passenger-form__textField passenger-applicant" disabled
  name="passenger-name" placeholder="Applcant's name" id="passenger-applicant">
  <input type="number" class="numberField passenger-form__numberField" name="passengerWeight" min="50"
  value="50" data-kg-value="50">
  </div>
  <button type="button" class="button" id="add">Add+</button>
  </fieldset>
  </fieldset>`
  fieldsetTickets.insertAdjacentHTML('beforebegin', additionalTicketPattern)
}

addTicketButton.addEventListener('click', addTicket)

//Validate

//Submit
function getFullData() {
  const result = {
    applicant: getApplicantData(),
    passengers: getPassengersData(),
    params: getParamsData(),
    // price
  }
  return result
}
function logFullData() {
  const fullData = getFullData()
  const json = JSON.stringify(fullData)
  console.log(json)
}
function submitHandler(e) {
  e.preventDefault()
  // VALIDATE
  logFullData()
  showPopup()
}

submitButton.addEventListener('click', submitHandler)