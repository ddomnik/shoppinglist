// Function to fetch the current state of items from the backend
function fetchItems() {
    $.get('/items', function (data) {
        const { openItems, closedItems } = data;
        // Display the items in their respective views
        displayItems(openItems, closedItems);
    });
}

// Function to display items in their respective views
function displayItems(openItems, closedItems) {
    // Clear existing items
    $("#first").empty();
    $("#second").empty();

    // Display open items
    openItems.forEach(function (itemText) {
        displayItem(itemText, "#first");
    });

    // Display closed items
    closedItems.forEach(function (itemText) {
        displayItem(itemText, "#second");
    });
}

// Function to display a single item
function displayItem(itemText, containerId) {
    var item = $("<div>").addClass("item").append($("<div>").text(itemText))
        .append($("<button>").addClass("delete-button").html(`
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
            </svg>
        `));
    $(containerId).append(item);
}

// Function to add a new item to the open view
function addItem(itemText) {
    $.ajax({
        url: '/items/open',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ item: itemText }),
        success: function () {
            fetchItems(); // Refresh items after adding
        }
    });
}

// Function to delete an item from the open view
function deleteItem(index) {
    $.ajax({
        url: '/items/open/' + index,
        type: 'DELETE',
        contentType: 'application/json',
        success: function () {
            fetchItems(); // Refresh items after deleting
        }
    });
}

// Function to move an item between views
function moveItem(view, index) {
    $.ajax({
        url: '/items/' + view + '/' + index,
        type: 'PUT',
        contentType: 'application/json',
        success: function () {
            fetchItems(); // Refresh items after moving
        }
    });
}

$(document).ready(function () {
    // Fetch initial state of items from backend on page load
    fetchItems();

    // Add event listener for delete buttons
    $(document).on("click", ".delete-button", function (event) {
        event.stopPropagation(); // Stop event propagation to prevent triggering the item click event
        const index = $(this).closest(".item").index();
        deleteItem(index);
    });

    // Add event listener for items
    $(document).on("click", ".item", function () {
        const view = $(this).parent().attr("id") === "first" ? 'open' : 'closed';
        const index = $(this).index();
        moveItem(view, index);
    });

    // Add event listener for add button
    $("#add-button").click(function () {
        var newItemText = $("#item-input").val().trim();
        console.log(newItemText)
        if (newItemText !== "") {
            addItem(newItemText);
            $("#item-input").val(""); // Clear input field
        }
    });

    // Add event listener for input field keypress
    $("#item-input").on("keypress", function (event) {
        // Check if the key pressed is "Enter" and the input field contains text
        if (event.which === 13 && $(this).val().trim() !== "") {
            addItem($(this).val().trim());
            $(this).val(""); // Clear input field
        }
    });

    // Add event listener for input field change
    $("#item-input").on("input", function () {
        var searchText = $(this).val().trim().toLowerCase(); // Get the search text and convert to lowercase

        $(".item").each(function () {
            var itemText = $(this).text().toLowerCase(); // Get the text of the item and convert to lowercase
            if (itemText.includes(searchText)) {
                $(this).show(); // Show the item if it contains the search text
            } else {
                $(this).hide(); // Hide the item if it does not contain the search text
            }
        });
    });
});


// A function is used for dragging and moving
function dragElement(element, direction) {
    var md; // remember mouse down info
    const first = document.getElementById("first");
    const second = document.getElementById("second");

    element.addEventListener('mousedown', onMouseDown);
    element.addEventListener('touchstart', onTouchStart);

    function onMouseDown(e) {
        md = {
            e,
            offsetTop: element.offsetTop,
            firstHeight: first.offsetHeight,
            secondHeight: second.offsetHeight
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    function onTouchStart(e) {
        if (e.touches.length !== 1) return;

        md = {
            e: e.touches[0],
            offsetTop: element.offsetTop,
            firstHeight: first.offsetHeight,
            secondHeight: second.offsetHeight
        };

        document.addEventListener('touchmove', onTouchMove);
        document.addEventListener('touchend', onTouchEnd);
    }

    function onMouseMove(e) {
        var delta = e.clientY - md.e.clientY;

        // Prevent negative-sized elements
        delta = Math.min(Math.max(delta, -md.firstHeight), md.secondHeight);

        element.style.top = md.offsetTop + delta + "px";
        first.style.height = (md.firstHeight + delta) + "px";
        second.style.height = (md.secondHeight - delta) + "px";
    }

    function onTouchMove(e) {
        if (e.touches.length !== 1) return;

        var delta = e.touches[0].clientY - md.e.clientY;

        // Prevent negative-sized elements
        delta = Math.min(Math.max(delta, -md.firstHeight), md.secondHeight);

        element.style.top = md.offsetTop + delta + "px";
        first.style.height = (md.firstHeight + delta) + "px";
        second.style.height = (md.secondHeight - delta) + "px";
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    function onTouchEnd() {
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
    }
}

dragElement(document.getElementById("separator"), "V");
