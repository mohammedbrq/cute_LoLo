document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');

    // State machine steps
    const steps = [
        {
            type: 'question',
            text: 'Hi!',
            buttons: [
                { text: 'Hey 👋', next: 1 }
            ],
            image: 'hk_wave.png'
        },
        {
            type: 'question',
            text: 'Whats your name?',
            buttons: [
                { text: 'Cute Lolo', next: 2 }
            ],
            image: 'hk_curious.png'
        },
        {
            type: 'statement',
            text: 'Mohammed loves you',
            buttons: [
                { text: '❤️', next: 3 }
            ],
            image: 'hk_love.png'
        },
        {
            type: 'question',
            text: 'Do u love me?',
            image: 'hk_shy.png',
            buttons: [
                { text: 'Yes I do', next: 4, id: 'yes-btn' },
                { text: 'No', action: 'reject', id: 'no-btn' }
            ]
        },
        {
            type: 'winner',
            text: 'YAY!!! You are the winner of Mohammed\'s heart! 💖🎉',
            subtext: '(Here is your virtual prize: 🎁🍰flowers💐)',
            image: 'hk_celebrate.png',
            buttons: [] // No buttons
        }
    ];

    let currentStep = 0;
    let noClickCount = 0; // Track how many times 'No' was clicked


    function renderStep(stepIndex) {
        const step = steps[stepIndex];

        // Reset no count if we are entering the love question (optional, but good for replay)
        if (stepIndex === 3) {
            noClickCount = 0;
        }

        // Function to create new content
        const createNewContent = () => {
            const wrapper = document.createElement('div');
            // Remove initial direct animation, we will control it via classes
            wrapper.classList.add('fade-enter');

            if (step.type === 'winner') {
                const h1 = document.createElement('h1');
                h1.className = 'winner-text';
                h1.textContent = step.text;
                wrapper.appendChild(h1);

                const p = document.createElement('p');
                p.textContent = step.subtext;
                wrapper.appendChild(p);

                createConfetti();
            } else {
                const h1 = document.createElement('h1');
                h1.textContent = step.text;
                wrapper.appendChild(h1);

                // Button container
                const btnContainer = document.createElement('div');
                btnContainer.className = 'btn-container';
                btnContainer.style.display = 'flex';
                btnContainer.style.flexDirection = 'column'; // Stack initially or wrap
                btnContainer.style.gap = '15px';
                btnContainer.style.alignItems = 'center';
                btnContainer.style.justifyContent = 'center';

                if (step.buttons) {
                    step.buttons.forEach(btnConfig => {
                        const btn = document.createElement('button');
                        btn.className = 'btn';
                        btn.textContent = btnConfig.text;
                        if (btnConfig.id) btn.id = btnConfig.id;

                        btn.onclick = () => {
                            if (btnConfig.next !== undefined) {
                                renderStep(btnConfig.next);
                            } else if (btnConfig.action === 'reject') {
                                handleReject();
                            }
                        };
                        btnContainer.appendChild(btn);
                    });
                }
                wrapper.appendChild(btnContainer);
            }
            return wrapper;
        };

        if (contentArea.children.length === 0) {
            // Update image
            const kittyImg = document.querySelector('.kitty-img');
            if (kittyImg && step.image) {
                kittyImg.src = `static/images/${step.image}`;
            }

            // First load
            const newContent = createNewContent();
            contentArea.appendChild(newContent);
            // Force reflow
            void newContent.offsetWidth;
            newContent.classList.add('fade-enter-active');
            newContent.classList.remove('fade-enter');
        } else {
            // Transition
            const currentContent = contentArea.firstElementChild;
            const kittyImg = document.querySelector('.kitty-img');

            // Start exit animations
            currentContent.classList.add('fade-exit');
            void currentContent.offsetWidth; // Force reflow
            currentContent.classList.add('fade-exit-active');
            currentContent.classList.remove('fade-exit');

            if (kittyImg) {
                kittyImg.classList.add('fade-out');
            }

            currentContent.addEventListener('transitionend', () => {
                currentContent.remove();

                // Update image source and fade in
                if (kittyImg && step.image) {
                    kittyImg.src = `static/images/${step.image}`;
                    // Wait a tiny bit or for load to fade back in
                    kittyImg.onload = () => {
                        kittyImg.classList.remove('fade-out');
                    };
                    // Safety timeout in case onload doesn't fire (cached)
                    setTimeout(() => kittyImg.classList.remove('fade-out'), 100);
                }

                const newContent = createNewContent();
                contentArea.appendChild(newContent);
                void newContent.offsetWidth; // Force reflow
                newContent.classList.add('fade-enter-active');
                newContent.classList.remove('fade-enter');
            }, { once: true });
        }
    }

    function handleReject() {
        noClickCount++;
        const yesBtn = document.getElementById('yes-btn');
        const noBtn = document.getElementById('no-btn');

        // Increase scale of Yes button
        const currentScale = 1 + (noClickCount * 0.5); // Grow by 0.5 each time
        if (yesBtn) {
            yesBtn.style.transform = `scale(${currentScale})`;
            yesBtn.style.zIndex = '10'; // Ensure it goes over other things
        }

        // Change text of No button
        const phrases = [
            "Are you sure?",
            "Are you really sure?",
            "Really really sure?",
            "Think again!",
            "Last chance!",
            "Surely not?",
            "You might regret this!",
            "Give it another thought!",
            "Are you absolutely certain?",
            "This could be a mistake!",
            "Have a heart!",
            "Don't be so cold!",
            "Change of heart?",
            "Wouldn't you reconsider?",
            "Is that your final answer?",
            "You're breaking my heart ;("
        ];


        const phraseIndex = Math.min(noClickCount - 1, phrases.length - 1);
        if (noBtn) {
            noBtn.textContent = phrases[phraseIndex];
            // Randomly move the no button to make it harder to click? (User didn't ask, but common in this meme)
            // User only asked "Forced to pick yes", growing Yes button is the main mech.
        }
    }

    function createConfetti() {
        // Simple emojis falling
        const emojis = ['❤️', '💖', '🎀', '🌸', '🎁', '😻'];

        setInterval(() => {
            const el = document.createElement('div');
            el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
            el.style.position = 'fixed';
            el.style.left = Math.random() * 100 + 'vw';
            el.style.top = '-50px';
            el.style.fontSize = (Math.random() * 20 + 20) + 'px';
            el.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
            el.style.zIndex = '1000';
            document.body.appendChild(el);

            setTimeout(() => {
                el.remove();
            }, 5000);
        }, 200);

        // Add keyframes for falling if not present
        if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.innerHTML = `
                @keyframes fall {
                    to { transform: translateY(110vh) rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Start
    const kittyImg = document.querySelector('.kitty-img');
    if (kittyImg && steps[0].image) {
        kittyImg.src = `static/images/${steps[0].image}`;
    }
    renderStep(0);
});
