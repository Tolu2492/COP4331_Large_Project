// Decorative background layer that provides the site-wide floating ingredient artwork.
const rails = [
  ['🍅', '🧄', '🥬', '🍋', '🌶️', '🥕', '🫒', '🧅'],
  ['🥑', '🍄', '🥔', '🌽', '🧀', '🥚', '🌿', '🍓'],
  ['🍝', '🥖', '🫘', '🍋', '🧄', '🌶️', '🥬', '🍅'],
  ['🥥', '🥒', '🥕', '🫑', '🍠', '🌽', '🫛', '🌿'],
  ['🍎', '🧈', '🍯', '🥐', '🍓', '🥛', '🫐', '🍞'],
  ['🧄', '🍋', '🍅', '🥬', '🍄', '🫒', '🌶️', '🧅'],
  ['🥚', '🧀', '🥔', '🌽', '🥑', '🍳', '🌿', '🍋'],
  ['🍜', '🍚', '🫘', '🥕', '🫑', '🍄', '🌿', '🍅'],
  ['🥭', '🥬', '🫐', '🍞', '🫒', '🌽', '🍋', '🌶️'],
  ['🍐', '🥖', '🍄', '🥕', '🌿', '🧅', '🍅', '🥑']
];

export default function BackgroundCarousel() {
  return (
    <div className="background-carousel" aria-hidden="true">
      {rails.map((rail, railIndex) => {
        let directionClass = 'scroll-down';
        if (railIndex % 2 === 0) {
          directionClass = 'scroll-up';
        }

        return (
          <div
            key={`rail-${railIndex}`}
            className={`background-rail ${directionClass}`}
            style={{
              ['--duration' as any]: `${32 + (railIndex % 5) * 4}s`,
              ['--offset' as any]: `${(railIndex % 4) * -8}%`
            }}
          >
            <div className="background-track">
              <div className="background-segment">
                {[...rail, ...rail].map((item, itemIndex) => (
                  <span key={`${railIndex}-a-${itemIndex}`} className="background-token">
                    {item}
                  </span>
                ))}
              </div>
              <div className="background-segment" aria-hidden="true">
                {[...rail, ...rail].map((item, itemIndex) => (
                  <span key={`${railIndex}-b-${itemIndex}`} className="background-token">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
