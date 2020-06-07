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
} from 'pts';

const space: CanvasSpace = new CanvasSpace('#pts').setup({
  bgcolor: 'black',
  retina: true,
  resize: true,
});
const form: CanvasForm = space.getForm();

function enneagram(scale: number, radius: number) {
  const vertices: Group = Create.radialPts(space.center, radius * scale, 9);
  form.line([
    vertices[5],
    vertices[7],
    vertices[1],
    vertices[4],
    vertices[2],
    vertices[8],
    vertices[5],
  ]);
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
  const context = form.ctx;
  Create.radialPts(
    space.center,
    ((innerRadius + outerRadius) / 2) * scale,
    phraseCount,
    angleOffset,
  ).forEach((anchor, raw_index) => {
    const index = (raw_index + indexOffset + phraseCount) % phraseCount;
    let rotation = raw_index * angleIncrement + angleOffset + Const.half_pi;
    // flip text if it would be upside-down
    if (0 < rotation && rotation < Const.pi) {
      rotation -= Const.pi;
    }

    context.save();
    context.translate(anchor.x, anchor.y);
    context.rotate(rotation);

    // TODO scale based on input phrase
    const phraseBox = Rectangle.fromCenter(new Pt(), 200);
    form.font(phraseFont).textBox(phraseBox, phrases[index]);

    context.restore();
  });
}

// TODO: align outside-of innerRadius
function phrasesOutsideRing(
  phrases: string[],
  font: Font,
  scale: number,
  innerRadius: number,
  angleOffset = 0,
  indexOffset = 0,
): void {
  const phraseCount = phrases.length;
  const angleIncrement = Const.two_pi / phraseCount;
  const phraseFont: Font = font ?? new Font(font.size, 'Cardo');
  Create.radialPts(space.center, innerRadius * scale, phraseCount, angleOffset).forEach(
    (anchor, raw_index) => {
      const index = (raw_index + indexOffset + phraseCount) % phraseCount;
      console.log(raw_index, '-->', index, phraseCount);

      // TODO scale based on input phrase
      const phraseBox = Rectangle.fromCenter(anchor, 200);
      form.font(phraseFont).textBox(phraseBox, phrases[index]);
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
): void {
  form.strokeOnly('white');
  const innerVertices: Group = Create.radialPts(space.center, innerRadius * scale, divisionCount);
  innerVertices.forEach((vertex, index) => {
    form.line(
      Line.fromAngle(
        vertex,
        (index - 3) * (Const.two_pi / divisionCount),
        (outerRadius - innerRadius) * scale,
      ),
    );
  });
}

function titleText(scale: number, timeOffset: number): void {
  form.fillOnly('white');

  const box: Bound = Bound.fromGroup(
    Rectangle.fromCenter(space.center, scale * 0.75, scale * 0.35),
  );
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

const actionList: string[] = [
  'SEED/POTENTIAL',
  'RELEASING',
  'REORGANIZING',
  'REVALUING',
  'UNDERSTANDING',
  'SHARING',
  'REALIZING',
  'IMPROVING',
  'EXPRESSING',
  'DECIDING',
  'ORGANIZING',
  'FOCUSING',
];
const genderList: string[] = [
  'Feminine',
  'Masculine',
  'Feminine',
  'Masculine',
  'Feminine',
  'Masculine',
  'Feminine',
  'Masculine',
  'Feminine',
  'Masculine',
  'Feminine',
  'Masculine',
];
const elementList: string[] = [
  'MUTABLE WATER',
  'FIXED AIR',
  'CARDINAL EARTH',
  'MUTABLE FIRE',
  'FIXED WATER',
  'CARDINAL AIR',
  'MUTABLE EARTH',
  'FIXED FIRE',
  'CARDINAL WATER',
  'MUTABLE AIR',
  'FIXED EARTH',
  'CARDINAL FIRE',
];
const qualityList: string[] = [
  'vicissitudes',
  'self-sacrifice',
  'verity',
  'repression',
  'inspiration',
  'originality',
  'idealism',
  'martyrdom?',
  'organization',
  'illumination',
  'exploration',
  'devotion',
  '???',
  'responsibility',
  'resourcefulness',
  'expiation???',
  'independence',
  'policy',
  '???',
  'experience',
  'achievement',
  'ambition',
  'reformation',
  'rulership',
  'research',
  'revelation',
  '???',
  'reason',
  'fidelity',
  'intuition',
  'mastership',
  'struggle',
  'determination',
  '???',
  '???',
  'activity',
];

const zodiacSymbols = ['♓', '♒', '♑', '♐', '♏', '♎', '♍', '♌', '♋', '♊', '♉', '♈'];

const zodiacThemes = [
  'Endings',
  'Goals and Ideals',
  'Mount Meru',
  'Higher Mind',
  'Death and Rebirth',
  'Relationships',
  'Health and Service',
  'Creative Expression',
  'Foundations',
  'Lower Mind',
  'Materiality',
  'New Beginnings',
];

const quadrantBig = ['PHYSICAL', 'SPIRITUAL', 'MENTAL', 'EMOTIONAL'];

const quadrantSmall = ['DIFFERENTIATION', 'UNITY', 'INTEGRATION', 'INDIVIDUATION'];

const hemispheres = ['CONJUNCTION', 'OPPOSITION'];
const squares = ['SQUARE', 'SQUARE'];
const semisquares = ['SEMISQUARE', 'SESQUIQUADRATE', 'SESQUIQUADRATE', 'SEMISQUARE'];
const trines = ['', 'TRINE', 'TRINE'];
const sextiles = [
  '',
  'SEMISEXTILE',
  'SEXTILE',
  '',
  '',
  'INCONJUNCT',
  '',
  'INCONJUNCT',
  '',
  '',
  'SEXTILE',
  'SEMISEXTILE',
];

function fontBetween(minSize: number, maxSize: number, family: string): (number) => Font {
  return (offset) => new Font(minSize + (maxSize - minSize) * offset, family);
}

space.add({
  animate: (time, ftime) => {
    let scale =
      Math.hypot((space.pointer.x - space.center.x) ** 2, (space.pointer.y - space.center.y) ** 2) /
      100;
    const offset = Num.cycle((time % 5000) / 5000);
    const constraint = Math.min(space.height, space.width) / 4;
    scale = constraint * offset + constraint;
    const ring_radii: number[] = [0.65, 0.71, 0.75, 0.81, 0.85];
    rings(scale, ring_radii);
    enneagram(scale, ring_radii[1]);
    divisions(scale, 12, ring_radii[0], ring_radii[2]);
    titleText(scale, offset);

    phrasesAlongRing(
      actionList,
      fontBetween(6, 10, 'Cardo')(offset),
      scale,
      ring_radii[2],
      ring_radii[3],
      0,
      3,
    );
    phrasesAlongRing(
      genderList,
      new Font(6, 'Cardo'),
      scale,
      ring_radii[2],
      ring_radii[3],
      (Const.two_pi * 0.5) / 12,
      1,
    );
    phrasesAlongRing(
      elementList,
      fontBetween(6, 8, 'Cardo')(offset),
      scale,
      ring_radii[1],
      ring_radii[2],
      (Const.two_pi * 0.5) / 12,
      3,
    );
    phrasesAlongRing(
      qualityList,
      new Font(6, 'Helvetica Neue'),
      scale,
      ring_radii[3],
      ring_radii[4],
      (Const.two_pi * 1) / 12 / 3 / 2,
      9,
    );
    phrasesAlongRing(
      zodiacSymbols,
      new Font(13, 'Cardo'),
      scale,
      ring_radii[0],
      ring_radii[1],
      (Const.two_pi * 0.5) / 12,
      3,
    );
    phrasesAlongRing(
      zodiacThemes,
      new Font(9, 'Helvetica Neue'),
      scale,
      ring_radii[0] - 0.05,
      ring_radii[0],
      (Const.two_pi * 0.5) / 12,
      3,
    );

    phrasesAlongRing(
      quadrantBig,
      new Font(36, 'Helvetica Neue'),
      scale,
      1.2,
      1.3,
      -Const.quarter_pi,
      1,
    );
    phrasesAlongRing(
      quadrantSmall,
      new Font(10, 'Helvetica Neue'),
      scale,
      1.12,
      1.2,
      -Const.quarter_pi,
      1,
    );

    phrasesOutsideRing(hemispheres, new Font(12, 'Cardo'), scale, ring_radii[4], -Const.half_pi, 0);
    phrasesOutsideRing(squares, new Font(11, 'Cardo'), scale, ring_radii[4], 0, 0);
    phrasesOutsideRing(semisquares, new Font(10, 'Cardo'), scale, ring_radii[4], -Const.quarter_pi, 0);
    phrasesOutsideRing(trines, new Font(11, 'Cardo'), scale, ring_radii[4], -Const.half_pi, 0);
    phrasesOutsideRing(sextiles, new Font(10, 'Cardo'), scale, ring_radii[4], -Const.half_pi, 0);
  },
});

space.bindMouse().bindTouch().play();
