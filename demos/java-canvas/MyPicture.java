import com.gigamonkeys.bhs.*;

public class MyPicture implements Picture {

  public void draw(Canvas c) {
    for (var x = 0; x < c.width(); x += 20) {
      c.drawLine(x, 0, x, c.height(), "rgba(0, 128, 192, 0.5)", 2);
    }
    c.drawLine(0, 0, c.width(), c.height(), "blue", 10);
    c.drawLine(0, c.height(), c.width(), 0, "red", 10);
    c.drawCircle(c.width() / 2, c.height() / 2, 50, "black", 2);
    c.drawFilledRect(20, 20, c.width() - 40, c.height() - 40, "#ff00ff20");
  }
}
