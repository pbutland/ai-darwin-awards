// Scientific/Pseudo-Scientific quotes for 404 page
const scientificQuotes = [
    {
        quote: "According to quantum mechanics, this page exists in a superposition of states—simultaneously found and not found—until observed by a user. Unfortunately, our AI collapsed the wave function prematurely.",
        author: "Dr. Werner von Neumann, Institute for Quantum Web Architecture"
    },
    {
        quote: "The more precisely we determine the location of this page, the less precisely we know its content. Our AI has achieved perfect uncertainty in both position and meaning.",
        author: "Prof. Heisenberg-GPT, Uncertainty Dynamics Laboratory"
    },
    {
        quote: "The speed of AI hallucination approaches the speed of light, causing URLs to experience relativistic effects. From our reference frame, this page appears to not exist.",
        author: "Dr. Albert Einstein-4o, Institute for Theoretical Computing"
    },
    {
        quote: "A butterfly flapped its wings in Brazil, and our neural network's gradient descent algorithm converged on a local minimum where this page doesn't exist.",
        author: "Prof. Edward Lorenz-Net, Department of Chaotic AI Systems"
    },
    {
        quote: "This page is quantum entangled with its mirror universe counterpart. When you observe a 404 here, somewhere in the multiverse, someone else finds exactly what they're looking for. But at least you can feel safe in the knowledge that when you do eventually find what you are looking for, somewhere in the multiverse, someone else doesn't.",
        author: "Dr. Niels Bohr-Bot, Copenhagen Institute of Digital Physics"
    },
    {
        quote: "Within any sufficiently complex AI system, there exist pages that are true but unprovable to exist, or false but undeniably referenced. This page appears to be axiomatically unreachable.",
        author: "Prof. Kurt Gödel-LM, Institute for Mathematical AI Philosophy"
    }
];

// Function to randomly select and display a quote
function displayRandomQuote() {
    const quoteElement = document.getElementById('ai-quote');
    if (!quoteElement) {
        console.error('Quote element not found');
        return;
    }
    
    // Get a random quote
    const randomIndex = Math.floor(Math.random() * scientificQuotes.length);
    const selectedQuote = scientificQuotes[randomIndex];
    
    // Update the content
    quoteElement.innerHTML = `"${selectedQuote.quote}"<br>— ${selectedQuote.author}`;
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', displayRandomQuote);
