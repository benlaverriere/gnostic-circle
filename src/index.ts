import {
  Bound,
  CanvasForm,
  CanvasSpace,
  Circle,
  Const,
  Create,
  Font,
  Line,
  Num,
  Group,
  Pt,
  Rectangle,
  Shaping,
} from 'pts';
import Words from './words';

const space: CanvasSpace = new CanvasSpace('#pts').setup({
  bgcolor: 'black',
  retina: true,
  resize: true,
});
const form: CanvasForm = space.getForm();

function enneagram(scale: number, radius: number) {
  const vertices: Group = Create.radialPts(space.center, radius * scale, 9);
  form.line([vertices[5], vertices[7], vertices[1], vertices[4], vertices[2], vertices[8], vertices[5]]);
  form.line([vertices[0], vertices[3], vertices[6], vertices[0]]);
}

function phrasesAlongRing(
  phrases: string[],
  font: Font,
  scale: number,
  innerRadius: number,
  outerRadius: number,
  angleOffset = 0,
  indexOffset = 0,
): void {
  const phraseCount = phrases.length;
  const angleIncrement = Const.two_pi / phraseCount;
  const phraseFont: Font = font ?? new Font(font.size, 'Cardo');
  form.font(phraseFont);

  const context = form.ctx;
  Create.radialPts(space.center, ((innerRadius + outerRadius) / 2) * scale, phraseCount, angleOffset).forEach(
    (anchor, raw_index) => {
      const index = (raw_index + indexOffset + phraseCount) % phraseCount;
      if (!phrases[index]) {
        return;
      }
      const textWidth = form.getTextWidth(phrases[index]);

      let rotation = raw_index * angleIncrement + angleOffset + Const.half_pi;

      // flip text if it would be upside-down
      if (anchor.y > space.center.y) {
        rotation -= Const.pi;
      }

      context.save();
      context.translate(anchor.x, anchor.y);
      context.rotate(rotation);

      const phraseBox = Rectangle.fromCenter(new Pt(), textWidth, phraseFont.size * 2);
      form.textBox(phraseBox, phrases[index]);

      context.restore();
    },
  );
}

function phrasesAlongRingAutosize(
  phrases: string[],
  fontFamily: string,
  scale: number,
  innerRadius: number,
  outerRadius: number,
  angleOffset = 0,
  indexOffset = 0,
): void {
  const phraseCount = phrases.length;
  const angleIncrement = Const.two_pi / phraseCount;
  const fontSize = 0.5 * ((outerRadius - innerRadius) * scale);
  const phraseFont: Font = new Font(fontSize, fontFamily);
  form.font(phraseFont);

  const context = form.ctx;
  Create.radialPts(space.center, ((innerRadius + outerRadius) / 2) * scale, phraseCount, angleOffset).forEach(
    (anchor, raw_index) => {
      const index = (raw_index + indexOffset + phraseCount) % phraseCount;
      if (!phrases[index]) {
        return;
      }
      const textWidth = form.getTextWidth(phrases[index]);

      let rotation = raw_index * angleIncrement + angleOffset + Const.half_pi;

      // flip text if it would be upside-down
      if (anchor.y > space.center.y) {
        rotation -= Const.pi;
      }

      context.save();
      context.translate(anchor.x, anchor.y);
      context.rotate(rotation);

      const phraseBox = Rectangle.fromCenter(new Pt(), textWidth, phraseFont.size * 2);
      form.textBox(phraseBox, phrases[index]);

      context.restore();
    },
  );
}

function phrasesOutsideRing(
  phrases: string[],
  font: Font,
  scale: number,
  innerRadius: number,
  angleOffset = 0,
  indexOffset = 0,
): void {
  const margin = 10;
  const phraseCount = phrases.length;
  const phraseFont: Font = font ?? new Font(font.size, 'Cardo');
  form.font(phraseFont);
  Create.radialPts(space.center, innerRadius * scale + margin, phraseCount, angleOffset).forEach(
    (anchor, raw_index) => {
      const index = (raw_index + indexOffset + phraseCount) % phraseCount;
      if (!phrases[index]) {
        return;
      }
      const textWidth = phrases[index].length > 2 ? form.getTextWidth(phrases[index]) : font.size * 3;
      let align: CanvasTextAlign = 'center';
      const newAnchor: Pt = new Pt(anchor);
      if (anchor.x < space.center.x) {
        align = 'right';
        newAnchor.x -= textWidth / 2;
      } else if (anchor.x > space.center.x) {
        align = 'left';
        newAnchor.x += textWidth / 2;
      }

      const phraseBox = Rectangle.fromCenter(newAnchor, textWidth, font.size * 2);
      form.alignText(align).textBox(phraseBox, phrases[index]);
    },
  );
}

function rings(scale: number, ringRadii: number[]): void {
  form.strokeOnly('white');
  ringRadii
    .map((radius) => {
      return Circle.fromCenter(space.center, radius * scale);
    })
    .forEach((ring) => {
      form.circle(ring);
    });
}

function divisions(
  scale: number,
  divisionCount: number,
  innerRadius: number,
  outerRadius: number,
  fractionalAngleOffset = 0,
): void {
  form.strokeOnly('white');
  const angleOffset = fractionalAngleOffset * (Const.two_pi / divisionCount);
  const innerVertices: Group = Create.radialPts(space.center, innerRadius * scale, divisionCount, angleOffset);
  const outerVertices: Group = Create.radialPts(space.center, outerRadius * scale, divisionCount, angleOffset);
  innerVertices.forEach((vertex, index) => {
    form.line([innerVertices[index], outerVertices[index]]);
  });
}

function titleText(scale: number, timeOffset: number): void {
  form.fillOnly('white');

  const box: Bound = Bound.fromGroup(Rectangle.fromCenter(space.center, scale * 0.75, scale * 0.35));
  const textBoxCenters: Group[] = Create.gridCells(box, 1, 10);

  const titleFont: Font = fontBetween(18, 24, 'Helvetica Neue')(timeOffset);
  const subtitleFont: Font = fontBetween(12, 14, 'Helvetica Neue')(timeOffset);

  form.alignText('center');
  form.font(titleFont).textBox(textBoxCenters[0], 'The Gnostic Circle');
  form.font(subtitleFont).textBox(textBoxCenters[2], 'THE ARCHETYPAL FORMS');
  form.font(subtitleFont).textBox(textBoxCenters[3], 'AND');
  form.font(subtitleFont).textBox(textBoxCenters[4], 'RHYTHMS OF EXISTENCE');
  form.font(subtitleFont).textBox(textBoxCenters[8], 'Map of Human');
  form.font(subtitleFont).textBox(textBoxCenters[9], 'Cosmology');
}

function fontBetween(minSize: number, maxSize: number, family: string): (number) => Font {
  return (offset) => new Font(minSize + (maxSize - minSize) * offset, family);
}

const ring_radii: number[] = [0.65, 0.71, 0.75, 0.81, 0.85];
space.add({
  animate: (time) => {
    const constraint = Math.min(space.height, space.width) / 4;
    const offset = Num.cycle((time % 8000) / 8000);

    const clockTickSpace = 2000;
    const clockTick = Shaping.exponentialIn((time % clockTickSpace) / clockTickSpace, 2, 0.05) + 1;
    const clockTickIndex = (count) => Math.floor((time / clockTickSpace) % count);

    const sweepTiming = 3000;
    const sweepTick = Shaping.quadraticInOut((time % sweepTiming) / sweepTiming, 2) + 1;
    const sweepTickIndex = (count) => Math.floor((time / sweepTiming) % count);

    const scale = constraint * 0.2 * offset + constraint * 1.7;

    rings(scale, ring_radii);
    enneagram(scale, ring_radii[1]);
    divisions(scale, 12, ring_radii[0], ring_radii[2], clockTick);
    titleText(scale, offset);

    phrasesAlongRingAutosize(Words.actions, 'Cardo', scale, ring_radii[2], ring_radii[3], 0, 3);
    phrasesAlongRingAutosize(
      Words.genders,
      'Cardo',
      scale,
      ring_radii[2] + 0.01,
      ring_radii[3] - 0.01,
      (Const.two_pi * 0.5) / 12,
      1,
    );
    phrasesAlongRingAutosize(
      Words.elements,
      'Cardo',
      scale,
      ring_radii[1],
      ring_radii[2],
      (Const.pi / 12) * clockTick,
      3 - clockTickIndex(Words.elements.length),
    );
    phrasesAlongRingAutosize(
      Words.qualities.map((word) => word.toUpperCase()),
      'Helvetica Neue',
      scale,
      ring_radii[3] + 0.008,
      ring_radii[4] - 0.008,
      (Const.pi / Words.qualities.length) * -clockTick,
      9 + clockTickIndex(Words.qualities.length),
    );
    phrasesAlongRingAutosize(
      Words.zodiacSymbols,
      'Cardo',
      scale,
      ring_radii[0],
      ring_radii[1],
      (Const.pi / Words.zodiacSymbols.length) * clockTick,
      3 - clockTickIndex(Words.zodiacSymbols.length),
    );
    phrasesAlongRingAutosize(
      Words.zodiacThemes,
      'Helvetica Neue',
      scale,
      ring_radii[0] - 0.04,
      ring_radii[0],
      (Const.two_pi * 0.5) / 12,
      3,
    );

    phrasesAlongRing(
      Words.quadrantBig,
      new Font(36, 'Helvetica Neue'),
      scale,
      1.2,
      1.3,
      -Const.quarter_pi * sweepTick,
      1 + sweepTickIndex(Words.quadrantBig.length),
    );
    phrasesAlongRing(
      Words.quadrantSmall,
      new Font(10, 'Helvetica Neue'),
      scale,
      1.12,
      1.2,
      -Const.quarter_pi * sweepTick,
      1 + sweepTickIndex(Words.quadrantSmall.length),
    );

    phrasesOutsideRing(Words.hemispheres, new Font(13, 'Cardo'), scale, ring_radii[4], -Const.half_pi, 0);
    phrasesOutsideRing(Words.squares, new Font(11, 'Cardo'), scale, ring_radii[4], 0, 0);
    phrasesOutsideRing(Words.semisquares, new Font(10, 'Cardo'), scale, ring_radii[4], -Const.quarter_pi, 0);
    phrasesOutsideRing(Words.trines, new Font(11, 'Cardo'), scale, ring_radii[4], -Const.half_pi, 0);
    phrasesOutsideRing(Words.sextiles, new Font(10, 'Cardo'), scale, ring_radii[4], -Const.half_pi, 0);

    phrasesOutsideRing(Words.planets, new Font(15, 'Cardo'), scale, 0.55, -Const.half_pi, 0);
  },
});

space.bindMouse().bindTouch().play();
