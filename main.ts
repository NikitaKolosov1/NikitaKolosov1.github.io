function getRouteData() { 
   fetch(`https://edu.std-900.ist.mospolytech.ru/api/routes?api_key=bbe92873-f198-4fdc-966c-9332a171f028`, { 
     method: "GET", 
}) 
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

function displayRouteTable(data) { 
   const tBody = document.querySelector(".routetable");
   tBody.innerHTML = ""; 
   for (let i = 0; i < data.length; i++) { 
   let row =`
            <tr> 
               <td class="p-3 border border-black">${data[i].name}</td> 
               <td class="p-3 border border-black">${data[i].description}</td> 
               <td class="p-3 border border-black">${data[i].mainObject}</td> 
            </tr>`; 
   tBody.insertAdjacentHTML("beforeend", row);
   } 
}

getRouteData();