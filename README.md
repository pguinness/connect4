# Connect 4

## Considerations
- I used **only one Bootstrap class**, `.container`. I chose this class because it provides a responsive layout and maintains dynamic horizontal margins, which is ideal for clean and flexible page structure.

## Implementation Details
The basic game is implemented using a `<table>`, with the drop buttons placed in the `<thead>` and the board cells placed in the `<tbody>`.

To structure the layout, I used a **flexbox-based container** composed of three sections:
1. an information panel on the left,  
2. the game board in the center, and  
3. a right-side "sentinel".

The sentinel has the same width as the info panel and ensures that the board stays perfectly centered on the page.  
Meanwhile, the board section itself is also a flex container, centered horizontally while keeping the board aligned at the top.

- **Single-page architecture**: The project consists of a single file, `index.html`, where all content is dynamically managed through JavaScript DOM manipulation.

I also used JavaScript classes to make the code more organized and to give the project a more object-oriented structure.

## Additional Features
I implemented several extra features to enhance the user experience:

- **Alternating starting player**: Each new game swaps the starting player. This is determined by checking whether the total number of games played is even or odd (using `score % 2`).
- **Piece-drop animation**: When a piece is played, a simple translation animation simulates its fall.
- **Column highlight on hover**: Hovering over a column's drop button highlights the entire column with a subtle grey shade.
- **Themes**: The settings page includes five selectable themes for the piece images.
- **Colour palette**: The UI uses the *Deep Sea* palette from [Coolors](https://coolors.co/):  
  `0D1B2A • 1B263B • 415A77 • 778DA9 • E0E1DD`
- **Improved player status UI**: A compact "status card" displays the current player's name and piece at all times.
- **End-game button**: Since matches can continue indefinitely (no score limit), I added a "Finish Game" button that shows the final score and redirects the user back to the main settings page.
