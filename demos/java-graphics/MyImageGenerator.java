import java.awt.Color;
import java.awt.Graphics;

import com.gigamonkeys.bhs.*;

public class MyImageGenerator implements ImageGenerator {

  public void draw(Graphics g, int width, int height) {
    g.setColor(Color.WHITE);
    g.fillRect(0, 0, width, height);

    g.setColor(Color.BLUE);
    g.fillOval(width / 4, height / 4, width / 2, height / 2);
  }

}
