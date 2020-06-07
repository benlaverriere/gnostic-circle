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

function phrasesInRing(
  scale: number,
  phrases: string[],
  size: number,
  innerRadius: number,
  outerRadius: number,
  angleOffset: number,
  indexOffset = 0,
): void {
  const phraseCount = phrases.length;
  const angleIncrement = Const.two_pi / phraseCount;
  const phraseFont: Font = new Font(size, 'Cardo');
  const context = form.ctx;
  Create.radialPts(
    space.center,
    ((innerRadius + outerRadius) / 2) * scale,
    phraseCount,
    angleOffset,
  ).forEach((anchor, raw_index) => {
    const index = (raw_index + indexOffset + phraseCount) % phraseCount;
    console.log(raw_index, '-->', index, phraseCount);
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

function titleText(scale: number): void {
  form.fillOnly('white');

  const box: Bound = Bound.fromGroup(
    Rectangle.fromCenter(space.center, scale * 0.75, scale * 0.35),
  );
  const textBoxCenters: Group[] = Create.gridCells(box, 1, 10);

  const titleFont: Font = new Font(24, 'Helvetica Neue');
  const subtitleFont: Font = new Font(14, 'Helvetica Neue');

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

const zodiacSymbols = [
  '♓',
  '♒',
  '♑',
  '♐\uFE0E',
  '♏',
  '♎',
  '♍',
  '♌',
  '♋',
  '♊',
  '♉',
  '♈',
];

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

const quadrantBig = [
  'PHYSICAL',
  'SPIRITUAL',
  'MENTAL',
  'EMOTIONAL',
];

const quadrantSmall = [
  'DIFFERENTIATION',
  'UNITY',
  'INTEGRATION',
  'INDIVIDUATION',
];

space.add({
  animate: (time, ftime) => {
    let scale =
      Math.hypot((space.pointer.x - space.center.x) ** 2, (space.pointer.y - space.center.y) ** 2) /
      100;
    let offset = Num.cycle( time%5000/5000 );
    let constraint = Math.min(space.height, space.width) / 4;
    scale = constraint * offset + constraint;
    const ring_radii: number[] = [0.65, 0.71, 0.75, 0.81, 0.85];
    rings(scale, ring_radii);
    enneagram(scale, ring_radii[1]);
    divisions(scale, 12, ring_radii[0], ring_radii[2]);
    titleText(scale);

    phrasesInRing(scale, actionList, 8, ring_radii[2], ring_radii[3], 0, 3);
    phrasesInRing(scale, genderList, 6, ring_radii[2], ring_radii[3], (Const.two_pi * 0.5) / 12, 1);
    phrasesInRing(
      scale,
      elementList,
      8,
      ring_radii[1],
      ring_radii[2],
      (Const.two_pi * 0.5) / 12,
      3,
    );
    phrasesInRing(
      scale,
      qualityList,
      6,
      ring_radii[3],
      ring_radii[4],
      (Const.two_pi * 1) / 12 / 3 / 2,
      9,
    );
    phrasesInRing(
      scale,
      zodiacSymbols,
      11,
      ring_radii[0],
      ring_radii[1],
      (Const.two_pi * 0.5) / 12,
      3,
    );
    phrasesInRing(
      scale,
      zodiacThemes,
      9,
      ring_radii[0] - 0.05,
      ring_radii[0],
      (Const.two_pi * 0.5) / 12,
      3,
    );

    phrasesInRing(scale, quadrantBig, 36, 1.2, 1.3, -Const.quarter_pi, 1);
    phrasesInRing(scale, quadrantSmall, 10, 1.12, 1.2, -Const.quarter_pi, 1);
  },
});

space.bindMouse().bindTouch().play();
