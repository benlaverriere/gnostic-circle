#!/usr/bin/env python3

# references:
# - Pango markup: https://developer.gnome.org/pango/stable/PangoMarkupFormat.html
# - line spacing: https://www.freetype.org/freetype2/docs/tutorial/step2.html

from __future__ import print_function
import math
import cairo
import gi

gi.require_version('Pango', '1.0')
gi.require_version('PangoCairo', '1.0')
from gi.repository import Pango, PangoCairo

SIZE = 800
BASE_FONT = Pango.font_description_from_string('Helvetica Normal 10')


def setup():
    surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, SIZE, SIZE)
    ctx = cairo.Context(surface)
    return surface, ctx


def draw_background(ctx):
    ctx.set_source_rgb(1, 1, 1)
    ctx.rectangle(0, 0, SIZE, SIZE)
    ctx.fill()


def draw_centered_circle(ctx, radius_percentage):
    ctx.set_source_rgb(0, 0, 0)
    ctx.set_line_width(1)
    ctx.arc(SIZE / 2.0, SIZE / 2.0, (SIZE / 2.0) * radius_percentage, 0, 2 * math.pi)
    ctx.stroke()


def draw_enneagram(ctx, radius):
    ctx.save()
    ctx.translate(SIZE / 2, SIZE / 2)
    ctx.rotate(-1 / 2 * math.pi)
    connect_points_on_circle(ctx, radius, [0 / 9, 3 / 9, 6 / 9])
    connect_points_on_circle(ctx, radius, [5 / 9, 7 / 9, 1 / 9, 4 / 9, 2 / 9, 8 / 9])
    ctx.restore()


def connect_points_on_circle(ctx, radius, points):
    ctx.save()
    ctx.set_source_rgb(0, 0, 0)
    ctx.set_line_width(2)
    ctx.set_line_join(cairo.LineJoin.BEVEL)
    for point in points:
        ctx.line_to(radius * math.cos(point * 2 * math.pi), radius * math.sin(point * 2 * math.pi))
    ctx.close_path()
    ctx.stroke()
    ctx.restore()


def draw_zodiac_divisions(ctx):
    ctx.save()
    ctx.translate(SIZE / 2, SIZE / 2)
    ctx.rotate(-1 / 2 * math.pi)
    for angle in range(1, 12):
        radius_segment(ctx, angle / 12, 0.65 * SIZE / 2, 0.75 * SIZE / 2)
    ctx.restore()


def radius_segment(ctx, angle, from_radius, to_radius):
    ctx.save()
    ctx.move_to(from_radius * math.cos(angle * 2 * math.pi),
                from_radius * math.sin(angle * 2 * math.pi))
    ctx.line_to(to_radius * math.cos(angle * 2 * math.pi),
                to_radius * math.sin(angle * 2 * math.pi))
    ctx.restore()


def title_text(ctx):
    layout = PangoCairo.create_layout(ctx)
    layout.set_font_description(BASE_FONT)
    layout.set_alignment(Pango.Alignment.CENTER)
    layout.set_markup(
        '<span size="large">The Gnostic Circle</span>\n\n'
        '<span size="x-small">THE ARCHETYPAL FORMS\nAND\nRHYTHMS OF EXISTENCE\n\n\n\n'
        'Map of Human\nCosmology</span>',
        -1)

    # centering
    _, extents = layout.get_pixel_extents()
    tw, th = extents.width, extents.height
    ctx.move_to(SIZE / 2 - tw / 2, SIZE / 2 - th / 2)
    PangoCairo.show_layout(ctx, layout)


def text_along_circle(ctx, markup, angle, radius):
    ctx.save()
    ctx.translate(SIZE / 2, SIZE / 2)  # TODO refactor this standard setup
    ctx.set_antialias(cairo.ANTIALIAS_BEST)

    layout = PangoCairo.create_layout(ctx)
    layout.set_font_description(BASE_FONT)
    layout.set_alignment(Pango.Alignment.CENTER)
    layout.set_markup(markup, -1)

    _, extents = layout.get_pixel_extents()
    tw, th = extents.width, extents.height

    # TODO flip text when angle exceeds...something
    ctx.rotate(angle * 2 * math.pi)
    ctx.move_to(-tw / 2, -radius - (th / 2))
    PangoCairo.show_layout(ctx, layout)
    ctx.restore()


def rotate_text(ctx, markup, cx, cy, angle):
    ctx.save()
    layout = PangoCairo.create_layout(ctx)
    layout.set_font_description(BASE_FONT)
    layout.set_alignment(Pango.Alignment.CENTER)
    layout.set_markup(markup, -1)

    _, extents = layout.get_pixel_extents()
    tw, th = extents.width, extents.height
    ctx.translate(cx, cy)
    ctx.rotate(angle * math.pi / 180)
    ctx.move_to(-tw, -th)
    ctx.line_to(0, 0)
    ctx.stroke()
    PangoCairo.show_layout(ctx, layout)
    ctx.restore()


def phrases_in_ring(phrases, size, inner_ring, angle_offset):
    for count, phrase in enumerate(phrases):
        text_along_circle(c, f'<span font="Serif Normal" size="{size}">{phrase}</span>',
                          count / len(phrases) + angle_offset,
                          ((rings[inner_ring + 1] - rings[inner_ring]) / 2 + rings[inner_ring]) * (
                                  SIZE / 2))


if __name__ == '__main__':
    (s, c) = setup()
    draw_background(c)
    rings = [0.65, 0.70, 0.75, 0.80, 0.85]
    for radius in rings:
        draw_centered_circle(c, radius)
    draw_enneagram(c, rings[1] * (SIZE / 2))
    draw_zodiac_divisions(c)
    title_text(c)

    action_list = ['SEED/POTENTIAL', 'RELEASING', 'REORGANIZING', 'REVALUING', 'UNDERSTANDING',
                   'SHARING', 'REALIZING', 'IMPROVING', 'EXPRESSING', 'DECIDING', 'ORGANIZING',
                   'FOCUSING']
    gender_list = ['Feminine', 'Masculine', 'Feminine', 'Masculine', 'Feminine', 'Masculine',
                   'Feminine', 'Masculine', 'Feminine', 'Masculine', 'Feminine', 'Masculine', ]
    element_list = ['MUTABLE WATER', 'FIXED AIR', 'CARDINAL EARTH', 'MUTABLE FIRE', 'FIXED WATER',
                    'CARDINAL AIR', 'MUTABLE EARTH', 'FIXED FIRE', 'CARDINAL WATER',
                    'MUTABLE AIR', 'FIXED EARTH', 'CARDINAL FIRE']
    quality_list = ['vicissitudes', 'self-sacrifice', 'verity', 'repression', 'inspiration',
                    'originality', 'idealism', 'martyrdom?', 'organization', 'illumination',
                    'exploration', 'devotion', '???', 'responsibility', 'resourcefulness',
                    'expiation???', 'independence', 'policy', '???', 'experience', 'achievement',
                    'ambition', 'reformation', 'rulership', 'research', 'revelation', '???',
                    'reason', 'fidelity', 'intuition', 'mastership', 'struggle', 'determination',
                    '???', '???', 'activity']

    phrases_in_ring([a.upper() for a in action_list], 'x-small', 2, 0)
    phrases_in_ring(gender_list, 'xx-small', 2, 0.5 / 12)
    phrases_in_ring([e.upper() for e in element_list], 'xx-small', 1, 0.5 / 12)
    phrases_in_ring([q.upper() for q in quality_list], 'xx-small', 3, 1 / 12 / 3 / 2)

    # TODO figure out a way to render the astrological symbols
    for count, phrase in enumerate(
            ['a♓cÆȎz', '♒', '♑', '♐\uFE0Exx', '♏', '♎', '♍', '♌', '♋', '♊', '♉', '♈']):
        text_along_circle(c,
                          f'<span font="Apple Color Emoji" fallback="true" size="small">{phrase}</span>',
                          count / 12 + 0.5 / 12,
                          ((rings[2] - rings[1]) / 2 + rings[1]) * (SIZE / 2))
    rotate_text(c,
                '<span size="xx-large">PHYSICAL</span>'
                '<span size="xx-small">\n\nDIFFERENTIATION</span>',
                100, 100, -45)
    s.write_to_png("example.png")
