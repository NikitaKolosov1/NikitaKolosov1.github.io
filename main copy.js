const domain = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru';
const key = 'bbe92873-f198-4fdc-966c-9332a171f028';

function proxify(url) {
    const proxyURL = new URL('/cors_proxy', 'http://192.168.1.67:8001');
    proxyURL.searchParams.set('url', url);

    return proxyURL;
}

function pluralize(n, content) {
    let result = content[2];
    n = Math.abs(n) % 100;
    let nt = n % 10;
    if (n >= 10 && n <= 20) result = content[2];
    else if (nt > 1 && nt < 5) result = content[0];
    else if (nt == 1) result = content[1];

    return `${n} ${result}`;
}

function showModal(guideData, routeData, modal) {
    const orderCnt = document.getElementById('order-body');
    const orderBtn = document.getElementById('order-send');

    orderCnt.innerHTML = '';

    let form = new FormData();
    form.set('guide_id', guideData.id);
    form.set('route_id', routeData.id);
    form.set('date', NaN);
    form.set('duration', 1);
    form.set('persons', 1);
    form.set('price', NaN);
    raw = `
        <div class="row">ФИО гида: ${guideData.name}</div>
        <div class="row">Название маршрута: ${routeData.name}</div>
        <div class="row">
            <div>Дата:<div>
            <input type="date" class="form-control" data-name="date">
        </div>
        <div class="row">
            <div>Время:<div>
            <input type="time"class="form-control" data-name="time">
        </div>
        <div class="row">
            <div>Длительность:<div>
            <select class="form-control" data-name="duration">
                <option value="1" selected>1 Час</option>
                <option value="2">2 Часа</option>
                <option value="3">3 Часа</option>
            </select>
        </div>
        <div class="row">
            <div>Число человек:<div>
            <input type="number" value="1" class="form-control" min="1" max="20" data-name="persons">
        </div>
        <div class="row">
            <div>Дополнительные опции:<div>
            <div>
                <input type="checkbox" id="featureA" class="form-check-input" data-name="optionFirst">
                <label for="featureA" class="form-check-label">Использовать скидку для пенсионеров</label>
                <p class="form-text">Стоимость уменьшается на 25%</p>
            </div>
            <div>
                <input type="checkbox" id="featureB" class="form-check-input" data-name="optionSecond">
                <label for="featureB" class="form-check-label">Легкие закуски и горячие напитки во время экскурсии</label>
                <p class="form-text">Увеличивают стоимость на 1000 рублей за каждого посетителя</p>
            </div>
        </div>
        
        <div class="row">
            <div>Cтоимость: <span id="order-price">NaN<span><div>
        </div>
    `;
    orderCnt.insertAdjacentHTML("beforeend", raw);
    const orderPrice = document.getElementById('order-price');

    orderCnt.onchange = (e) => {
        console.log(e.target);
        switch (e.target.dataset['name']) {
        case 'date':
            form.set('date', e.target.value);
            break;
        case 'time':
            form.set('time', e.target.value);
            break;
        case 'duration':
            form.set('duration', e.target.value);
            break;
        case 'persons':
            form.set('persons', e.target.value);
            break;
        case 'optionFirst':
            console.log(e.target.checked);
            form.set('optionFirst', (e.target.checked ? 1 : 0));
            break;
        case 'optionSecond':
            console.log(e.target.checked);
            form.set('optionSecond', (e.target.checked ? 1 : 0));
            console.log(form.get('optionSecond'));
            break;
        default:
            return;
        }

        const date = form.get('date');
        const day = new Date(date).getDay();

        const time = form.get('time') ?? '';
        const hour = parseInt(time.split(':')[0]);
        const isMorning = (hour >= 9 && hour <= 12);
        const isEvening = (hour >= 20 && hour <= 23);

        const persons = parseInt(form.get('persons'));

        let priceForN = 0;
        if (isNaN(persons))
            priceForN = NaN;
        if (persons >= 5)
            priceForN = 1000;
        else if (persons >= 10)
            priceForN = 1500;

        let duration = parseInt(form.get('duration'));

        let price = guideData.pricePerHour
            * duration
            * ((isNaN(day) || isNaN(hour)) ? NaN : 1)
            * ((day == 0 || day == 6) ? 1.5 : 1)
            + (isMorning ? 400 : 0)
            + (isEvening ? 1000 : 0)
            + priceForN;

        if (form.get('optionFirst') == 1) {
            console.log('of', form.get('optionFirst'));
            price -= parseInt(price * 0.25);
        }
        if (form.get('optionSecond') == 1) {
            console.log(form.get('optionSecond'));
            price += persons * 1000;
        }

        form.set('price', price);

        console.log(price);

        if (isNaN(form.get('price'))) {
            orderBtn.classList.remove('btn-primary');
            orderBtn.classList.add('btn-secondary');
            orderPrice.textContent = 'NaN';
        } else {
            orderBtn.classList.add('btn-primary');
            orderBtn.classList.remove('btn-secondary');
            orderPrice.textContent = `${price}р`;
        }

    };

    orderBtn.onclick = () => {
        if (isNaN(form.get('price'))) return;

        modal.toggle();
        addOrder(form);
    };
}

function displayGuideTable(data, routeData) { 
    document.getElementById('guidesSection').classList.remove('d-none');
    const cnt = document.getElementById('guides-list');
    cnt.innerHTML = '';
    cnt.scrollIntoView({ behavior: 'smooth' });

    for (let element of data) {
        const guideCnt = cnt.appendChild(
            document.createElement('tr')
        );

        const workExperience = pluralize(
            element.workExperience,
            ['года', 'год', 'лет']
        );

        let row = `
            <td class="p-2 border">
                <i class="bi bi-people-fill"></i>
            </td>
            <td class="p-2 border">${element.name}</td>
            <td class="p-2 border d-none d-sm-table-cell">${element.language}</td>
            <td class="p-2 border d-none d-md-table-cell">${workExperience}</td>
            <td class="p-2 border">${element.pricePerHour}р/час</td>`;
        guideCnt.insertAdjacentHTML("beforeend", row);

        const routeChoiseCnt = guideCnt.appendChild(
            document.createElement('td')
        );
        routeChoiseCnt.className = 'p-2 border';

        const routeChoise = routeChoiseCnt.appendChild(
            document.createElement('button')
        );
        routeChoise.className = 'btn btn-primary';
        routeChoise.textContent = 'Выбрать';
        routeChoise.onclick = () => {
            let modal = new bootstrap.Modal('#guideModal');
            modal.toggle();

            showModal(element, routeData, modal);
        };
    }
}

function displayRouteTable(data) {
    const cnt = document.getElementById('routes-list');
    cnt.innerHTML = '';
    for (let element of data) {
        const routeCnt = cnt.appendChild(
            document.createElement('tr')
        );

        let row = `
            <td class="p-3 border">${element.name}</td>
            <td class="p-3 d-none d-md-table-cell border">${element.description}</td>
            <td class="p-3 d-none d-lg-table-cell border">${element.mainObject}</td>`;
        routeCnt.insertAdjacentHTML("beforeend", row);

        const routeChoise = routeCnt.appendChild(
            document.createElement('button')
        );
        routeChoise.className = 'btn btn-primary';
        routeChoise.textContent = 'Выбрать';
        routeChoise.onclick = () => {
            getGuidesData(element);
        };
    }
}

function getRouteData() { 
    fetch(
        proxify(`${domain}/api/routes?api_key=${key}`)
    )
        .then((response) => { 
            if (!response.ok) { 
                throw new Error(`Ошибка ${response.status}`); 
            } 
            return response.json(); 
        }) 
        .then((data) => { 
            console.log(data); 
            displayRouteTable(data);
        }); 
}

function getGuidesData(routeData) {
    fetch(
        proxify(`${domain}/api/routes/${routeData.id}/guides?api_key=${key}`)
    )
        .then((response) => { 
            if (!response.ok) { 
                throw new Error(`Ошибка ${response.status}`); 
            } 
            return response.json(); 
        }) 
        .then((data) => { 
            console.log(data);
            displayGuideTable(data, routeData);
        })
        .catch(e => console.log(e));
}

function addOrder(data) {
    fetch(
        proxify(`${domain}/api/orders?api_key=${key}`),
        { method: 'POST', body: data}
    )
        .then((response) => { 
            if (!response.ok) { 
                throw new Error(`Ошибка ${response.status}`); 
            } 
            return response.json();
        }) 
        .then((data) => {
            createAlert(
                'Заявка успешно создана',
                'success'
            );
            console.log(data);
        })
        .catch(e => {
            createAlert(
                'Во время заполнения заявки произошла ошибка. Попробуйте снова',
                'warning'
            );
        });
}

function createAlert(text, type) {
    const cnt = document.getElementById('alerts').appendChild(
        document.createElement('div')
    );
    const raw = `
        <div class="alert alert-${type} alert-dismissible" role="alert" >
            <div>${text}</div>
            <button class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;
    cnt.insertAdjacentHTML("beforeend", raw);
}

getRouteData();