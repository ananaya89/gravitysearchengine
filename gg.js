document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchHistoryList = document.getElementById('searchHistory');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const elements = ['title', 'searchBar', 'historySection'];

    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

    // Display search history
    function displaySearchHistory() {
        searchHistoryList.innerHTML = '';
        searchHistory.forEach(term => {
            const li = document.createElement('li');
            li.textContent = term;
            searchHistoryList.appendChild(li);
        });
    }

    // Add search term to history
    function addSearchTerm(term) {
        searchHistory.push(term);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        displaySearchHistory();
    }

    searchBtn.addEventListener('click', function () {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            addSearchTerm(searchTerm);
            searchInput.value = '';
        }
    });

    clearHistoryBtn.addEventListener('click', function () {
        searchHistory = [];
        localStorage.removeItem('searchHistory');
        displaySearchHistory();
    });

    displaySearchHistory();

    // Using Matter.js for the Google Gravity effect
    const { Engine, Render, World, Bodies, Mouse, MouseConstraint } = Matter;

    // Create engine and renderer, with render turned OFF for visual objects
    const engine = Engine.create();
    const render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,    // Disable wireframes for rendering bodies
            background: '#f4f4f9', // Background color for the screen
            showAngleIndicator: false, // Remove angle indicators
            showCollisions: false, // Disable collision outlines
            visible: false         // Completely hide Matter.js render canvas
        }
    });

    // Function to get the bounding box of an element and create a corresponding physics body
    function createPhysicsBody(id) {
        const el = document.getElementById(id);
        const rect = el.getBoundingClientRect();
        const body = Bodies.rectangle(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            rect.width,
            rect.height,
            {
                restitution: 0.9,  // Bounciness to make them bounce off screen edges
                friction: 0.05,    // Reduce friction to make them move smoothly
                isStatic: false    // Allow the element to fall and move
            }
        );
        return { element: el, body };
    }

    // Create physics bodies for all the elements
    const elementBodies = elements.map(id => createPhysicsBody(id));

    // Create boundaries (walls) around the screen so elements don't fall off
    const boundaries = [
        Bodies.rectangle(window.innerWidth / 2, 0, window.innerWidth, 10, { isStatic: true }), // Top wall
        Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, 10, { isStatic: true }), // Bottom wall
        Bodies.rectangle(0, window.innerHeight / 2, 10, window.innerHeight, { isStatic: true }), // Left wall
        Bodies.rectangle(window.innerWidth, window.innerHeight / 2, 10, window.innerHeight, { isStatic: true }) // Right wall
    ];

    // Add all bodies and boundaries to the world
    World.add(engine.world, [...elementBodies.map(e => e.body), ...boundaries]);

    // Mouse constraint to allow dragging elements
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false  // Disable rendering of the mouse constraint
            }
        }
    });
    World.add(engine.world, mouseConstraint);

    // Run the engine but NOT the renderer, to avoid additional visuals
    Engine.run(engine);

    // Sync HTML elements with their Matter.js bodies (only elements will move, no extra visuals)
    (function update() {
        elementBodies.forEach(({ element, body }) => {
            element.style.position = 'absolute';
            element.style.left = `${body.position.x - body.bounds.max.x + body.bounds.min.x}px`;
            element.style.top = `${body.position.y - body.bounds.max.y + body.bounds.min.y}px`;
            element.style.transform = `rotate(${body.angle}rad)`;
        });
        requestAnimationFrame(update);
    })();
});
