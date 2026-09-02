# Thermal receipt printing

The `receipt-58` and `receipt-80` presets describe the full paper-roll width, not every printer's printable width. A printer may reserve hardware margins on either side. Confirm the printable width in the printer documentation and run a short test before using a receipt in production. Do not reduce the entire PDF to compensate for unknown margins; select the matching preset and adapt the composition's safe area when a qualified device requires it.

Print at **100% / actual size**. Disable fit-to-page, shrink-to-fit, and page imposition. A 58 mm receipt PDF must remain 58 mm wide and must not be placed on A4 or split into invoice-style pages. The generated height follows the measured content and is limited to 2,000 mm. When content exceeds that limit, docn-ui returns an explicit layout error; remove lines or shorten content and render again.

The templates use a monochrome-safe structure with readable point sizes, but a PDF preview cannot qualify paper sensitivity, dot density, cutter offsets, driver margins, speed, heat, or contrast on a physical device. This project does not send ESC/POS commands and does not claim compatibility with every thermal printer. Keep the first printed sample as the hardware qualification for the selected printer, driver, paper, and operating system.
