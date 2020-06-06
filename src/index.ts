import { CanvasForm, CanvasSpace, Num } from 'pts';

const space: CanvasSpace = new CanvasSpace('#pts').setup({
  bgcolor: '#eee',
  retina: true,
  resize: true,
});
const form: CanvasForm = space.getForm();

space.add({
  animate: (time, ftime) => {
    const radius = Num.cycle((time % 1000) / 1000) * 20;
    form.fill('#09f').point(space.pointer, radius, 'circle');
  },
});

space.bindMouse().bindTouch().play();
