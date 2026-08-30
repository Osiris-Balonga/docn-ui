# Printing label sheets

Label sheets are generated on A4 or Letter pages from explicit label dimensions, page margins, horizontal and vertical gaps, a first-page starting cell, and an ordered quantity. The first page begins at the selected cell; every later page resumes at cell zero. Impossible geometry is rejected rather than clipped or silently scaled.

## Before printing

1. Confirm the PDF page size is the same as the paper loaded in the printer.
2. Print at **100%**, **Actual size**, or the driver option that disables scaling.
3. Disable **Fit**, **Shrink oversized pages**, and borderless enlargement.
4. Print one test sheet on plain paper and place it behind the label stock against a light source.
5. Check the first and last occupied cells, then adjust the configured page margins or gaps if the printer introduces an offset.

The PDF coordinates describe the requested digital geometry. A printer may have non-printable hardware margins, feed drift, or driver-specific offsets. Browser preview dimensions and automated coordinate checks do not qualify a physical printer or paper stock.

## Partial sheets

Use the starting cell only for the first page when some labels have already been removed. Cells are numbered from zero in row-major order: left to right, then top to bottom. Do not send a previously used sheet through a printer if its backing is damaged, curled, or missing labels in a way the printer manufacturer prohibits.

## Compatibility limits

The presets are dimensional docn-ui profiles, not commercial-stock certifications. docn-ui does not claim compatibility with Avery or any other manufacturer reference without a physical comparison of that exact stock, printer, driver, and scale setting. Cut lines, feeding, adhesive behavior, and physical alignment remain the user's responsibility.
